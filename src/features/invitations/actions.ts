"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type InvitationActionState = { error?: string };

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
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
    target_token_hash: await hashToken(token),
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
