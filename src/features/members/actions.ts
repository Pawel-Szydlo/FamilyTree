"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MemberActionState = { error?: string; success?: string };
const roles = ["owner", "admin", "editor", "member", "viewer"] as const;
type Role = (typeof roles)[number];

async function authorize(familyId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, user: null, role: null as Role | null };
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
    role: (membership.data?.role as Role | undefined) ?? null,
  };
}

function canManage(role: Role | null) {
  return role === "owner" || role === "admin";
}

export async function updateMemberRole(
  _previous: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const familyId = String(formData.get("family_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const nextRole = String(formData.get("role") ?? "") as Role;
  if (!roles.includes(nextRole)) return { error: "Nieprawidłowa rola." };
  const { supabase, role } = await authorize(familyId);
  if (!canManage(role)) return { error: "Nie masz uprawnień do zmiany ról." };
  if (nextRole === "owner" && role !== "owner") {
    return { error: "Tylko owner może nadać rolę ownera." };
  }
  const target = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!target.data) return { error: "Członek nie należy do tej rodziny." };
  if (target.data.role === "owner" && role !== "owner") {
    return { error: "Admin nie może zmienić roli ownera." };
  }
  if (target.data.role === "owner" && nextRole !== "owner") {
    const owners = await supabase
      .from("family_members")
      .select("user_id", { count: "exact", head: true })
      .eq("family_id", familyId)
      .eq("role", "owner")
      .eq("status", "active");
    if ((owners.count ?? 0) <= 1) {
      return { error: "Rodzina musi mieć co najmniej jednego ownera." };
    }
  }
  const { error } = await supabase
    .from("family_members")
    .update({ role: nextRole })
    .eq("family_id", familyId)
    .eq("user_id", userId);
  if (error) return { error: "Nie udało się zmienić roli." };
  revalidatePath(`/family/${familyId}/settings`);
  return { success: "Rola została zmieniona." };
}

export async function removeMember(
  _previous: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const familyId = String(formData.get("family_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const { supabase, role } = await authorize(familyId);
  if (!canManage(role))
    return { error: "Nie masz uprawnień do usuwania członków." };
  const target = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!target.data) return { error: "Członek nie należy do tej rodziny." };
  if (target.data.role === "owner" && role !== "owner") {
    return { error: "Admin nie może usunąć ownera." };
  }
  if (target.data.role === "owner") {
    const owners = await supabase
      .from("family_members")
      .select("user_id", { count: "exact", head: true })
      .eq("family_id", familyId)
      .eq("role", "owner")
      .eq("status", "active");
    if ((owners.count ?? 0) <= 1) {
      return { error: "Nie można usunąć ostatniego ownera." };
    }
  }
  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("family_id", familyId)
    .eq("user_id", userId);
  if (error) return { error: "Nie udało się usunąć członka." };
  revalidatePath(`/family/${familyId}/settings`);
  return { success: "Członek został usunięty." };
}
