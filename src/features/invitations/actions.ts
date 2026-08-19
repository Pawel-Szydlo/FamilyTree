"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFamilyById } from "@/features/families/queries";
import { createClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "./mailer";
import { createInvitationSchema, type InvitationRole } from "./schema";
import {
  createInvitationToken,
  hashInvitationToken,
  invitationExpiry,
} from "./token";

export type InvitationActionState = { error?: string };

async function authorizeManager(familyId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, user: null, allowed: false };
  const membership = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();
  return {
    supabase,
    user: auth.user,
    allowed: ["owner", "admin"].includes(membership.data?.role),
  };
}

export async function createInvitation(
  _previous: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const parsed = createInvitationSchema.safeParse({
    family_id: formData.get("family_id"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Sprawdź adres e-mail i rolę." };
  const { supabase, user, allowed } = await authorizeManager(
    parsed.data.family_id,
  );
  if (!user || !allowed)
    return { error: "Nie masz uprawnień do zapraszania członków." };
  const family = await getFamilyById(parsed.data.family_id);
  if (!family) return { error: "Rodzina nie istnieje." };
  const token = createInvitationToken();
  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({
      family_id: parsed.data.family_id,
      email: parsed.data.email,
      role: parsed.data.role as InvitationRole,
      status: "pending",
      token_hash: hashInvitationToken(token),
      expires_at: invitationExpiry().toISOString(),
      invited_by: user.id,
    })
    .select("id")
    .maybeSingle();
  if (error || !invitation)
    return { error: "Nie udało się utworzyć zaproszenia." };
  try {
    await sendInvitationEmail({
      recipient: parsed.data.email,
      familyName: family.name,
      token,
    });
  } catch {
    await supabase
      .from("invitations")
      .update({ status: "revoked" })
      .eq("id", invitation.id);
    return { error: "Nie udało się wysłać zaproszenia." };
  }
  revalidatePath(`/family/${parsed.data.family_id}/settings`);
  return {};
}

export async function revokeInvitation(
  _previous: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const familyId = String(formData.get("family_id") ?? "");
  const invitationId = String(formData.get("invitation_id") ?? "");
  const { supabase, allowed } = await authorizeManager(familyId);
  if (!allowed)
    return { error: "Nie masz uprawnień do zarządzania zaproszeniami." };
  const { error } = await supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("family_id", familyId)
    .eq("status", "pending");
  if (error) return { error: "Nie udało się unieważnić zaproszenia." };
  revalidatePath(`/family/${familyId}/settings`);
  return {};
}

export async function acceptInvitation(
  _previous: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "Brak tokenu zaproszenia." };
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user)
    return { error: "Zaloguj się, aby zaakceptować zaproszenie." };
  const { data: familyId, error } = await supabase.rpc("accept_invitation", {
    target_token_hash: hashInvitationToken(token),
  });
  if (error || !familyId) {
    const detail = error?.message.toLowerCase() ?? "";
    return {
      error:
        detail.includes("expired") || detail.includes("invalid")
          ? "Zaproszenie jest nieprawidłowe lub wygasło."
          : "Nie udało się zaakceptować zaproszenia.",
    };
  }
  redirect(`/family/${familyId}/tree`);
}
