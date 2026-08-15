"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseParentLinkForm, parsePartnershipForm } from "./schema";

export type RelationshipActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
const editableRoles = ["owner", "admin", "editor"];

function validationState(
  issues: { path: PropertyKey[]; message: string }[],
): RelationshipActionState {
  return {
    error: "Sprawdź formularz.",
    fieldErrors: Object.fromEntries(
      issues.map((issue) => [String(issue.path[0]), issue.message]),
    ),
  };
}

async function authorize(familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { supabase, user: null, allowed: false };
  const membership = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .maybeSingle();
  return {
    supabase,
    user: data.user,
    allowed: Boolean(
      membership.data && editableRoles.includes(membership.data.role),
    ),
  };
}

function databaseError(message: string, error: { message?: string } | null) {
  const detail = error?.message?.toLowerCase() ?? "";
  if (
    detail.includes("cycle") ||
    detail.includes("self") ||
    detail.includes("duplicate") ||
    detail.includes("unique")
  )
    return { error: message };
  return { error: "Nie udało się zapisać relacji. Spróbuj ponownie." };
}

export async function createPartnership(
  _previous: RelationshipActionState,
  formData: FormData,
): Promise<RelationshipActionState> {
  const parsed = parsePartnershipForm(formData);
  if (!parsed.success) return validationState(parsed.error.issues);
  const { supabase, user, allowed } = await authorize(parsed.data.family_id);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do edycji relacji." };
  const { data: partnership, error } = await supabase
    .from("partnerships")
    .insert({
      family_id: parsed.data.family_id,
      partnership_type: parsed.data.partnership_type,
      status: parsed.data.status,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      notes: parsed.data.notes,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error || !partnership)
    return databaseError("Nie udało się utworzyć związku.", error);
  const { error: memberError } = await supabase
    .from("partnership_members")
    .insert(
      parsed.data.partner_ids.map((person_id, position) => ({
        partnership_id: partnership.id,
        person_id,
        position,
        role:
          parsed.data.partnership_type === "marriage" ? "spouse" : "partner",
      })),
    );
  if (memberError) {
    await supabase.from("partnerships").delete().eq("id", partnership.id);
    return databaseError("Nie udało się dodać partnerów.", memberError);
  }
  revalidatePath(`/family/${parsed.data.family_id}/relationships`);
  return { success: "Związek został dodany." };
}

export async function updatePartnership(
  _previous: RelationshipActionState,
  formData: FormData,
): Promise<RelationshipActionState> {
  const parsed = parsePartnershipForm(formData);
  if (!parsed.success) return validationState(parsed.error.issues);
  if (!parsed.data.partnership_id)
    return { error: "Brak identyfikatora związku." };
  const { supabase, user, allowed } = await authorize(parsed.data.family_id);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do edycji relacji." };
  const { data: existingMembers } = await supabase
    .from("partnership_members")
    .select("person_id, role, position")
    .eq("partnership_id", parsed.data.partnership_id)
    .order("position");
  const { error } = await supabase
    .from("partnerships")
    .update({
      partnership_type: parsed.data.partnership_type,
      status: parsed.data.status,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      notes: parsed.data.notes,
    })
    .eq("id", parsed.data.partnership_id)
    .eq("family_id", parsed.data.family_id);
  if (error)
    return databaseError("Nie udało się zaktualizować związku.", error);
  const { error: membersError } = await supabase
    .from("partnership_members")
    .delete()
    .eq("partnership_id", parsed.data.partnership_id);
  if (membersError)
    return databaseError(
      "Nie udało się zaktualizować partnerów.",
      membersError,
    );
  const { error: insertError } = await supabase
    .from("partnership_members")
    .insert(
      parsed.data.partner_ids.map((person_id, position) => ({
        partnership_id: parsed.data.partnership_id,
        person_id,
        position,
        role:
          parsed.data.partnership_type === "marriage" ? "spouse" : "partner",
      })),
    );
  if (insertError) {
    if (existingMembers?.length) {
      await supabase.from("partnership_members").insert(
        existingMembers.map((member) => ({
          partnership_id: parsed.data.partnership_id,
          person_id: member.person_id,
          role: member.role,
          position: member.position,
        })),
      );
    }
    return databaseError("Nie udało się zaktualizować partnerów.", insertError);
  }
  revalidatePath(`/family/${parsed.data.family_id}/relationships`);
  return { success: "Związek został zaktualizowany." };
}

export async function createParentLink(
  _previous: RelationshipActionState,
  formData: FormData,
): Promise<RelationshipActionState> {
  const parsed = parseParentLinkForm(formData);
  if (!parsed.success) return validationState(parsed.error.issues);
  const { supabase, user, allowed } = await authorize(parsed.data.family_id);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do edycji relacji." };
  const { error } = await supabase.from("parent_links").insert({
    family_id: parsed.data.family_id,
    parent_person_id:
      parsed.data.parent_source === "person"
        ? parsed.data.parent_person_id
        : null,
    parent_partnership_id:
      parsed.data.parent_source === "partnership"
        ? parsed.data.parent_partnership_id
        : null,
    child_person_id: parsed.data.child_person_id,
    relation_type: parsed.data.relation_type,
    status: parsed.data.status,
    notes: parsed.data.notes,
    created_by: user.id,
  });
  if (error)
    return databaseError(
      "Nie można dodać tej relacji: sprawdź, czy nie tworzysz duplikatu, relacji z samą sobą lub cyklu genealogicznego.",
      error,
    );
  revalidatePath(`/family/${parsed.data.family_id}/relationships`);
  return { success: "Relacja rodzic–dziecko została dodana." };
}
