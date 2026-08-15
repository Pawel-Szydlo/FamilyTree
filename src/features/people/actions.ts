"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parsePersonForm } from "./schema";

export type PersonActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
const editableRoles = ["owner", "admin", "editor"];

function validationState(
  issues: { path: PropertyKey[]; message: string }[],
): PersonActionState {
  return {
    error: "Sprawdź formularz.",
    fieldErrors: Object.fromEntries(
      issues.map((issue) => [String(issue.path[0]), issue.message]),
    ),
  };
}

async function authorize(familyId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { supabase, user: null, allowed: false };
  const { data } = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .maybeSingle();
  return {
    supabase,
    user: authData.user,
    allowed: Boolean(data && editableRoles.includes(data.role)),
  };
}

export async function createPerson(
  _previous: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const parsed = parsePersonForm(formData);
  if (!parsed.success) return validationState(parsed.error.issues);
  const { supabase, user, allowed } = await authorize(parsed.data.family_id);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do edycji osób." };
  const { error } = await supabase.from("people").insert({
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    preferred_name: parsed.data.preferred_name,
    biography: parsed.data.biography,
    avatar_path: parsed.data.avatar_path,
    birth_day: parsed.data.birth_day,
    birth_month: parsed.data.birth_month,
    birth_year: parsed.data.birth_year,
    birth_year_visible: parsed.data.birth_year_visible,
    is_living: parsed.data.is_living,
    is_placeholder: parsed.data.is_placeholder,
    privacy_level: parsed.data.privacy_level,
    family_id: parsed.data.family_id,
    created_by: user.id,
  });
  if (error)
    return { error: "Nie udało się utworzyć osoby. Spróbuj ponownie." };
  revalidatePath(`/family/${parsed.data.family_id}/people`);
  revalidatePath(`/family/${parsed.data.family_id}/tree`);
  return { success: "Osoba została dodana." };
}

export async function updatePerson(
  _previous: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const parsed = parsePersonForm(formData);
  if (!parsed.success) return validationState(parsed.error.issues);
  if (!parsed.data.person_id || !parsed.data.expected_updated_at)
    return { error: "Brak informacji o wersji osoby." };
  const { supabase, user, allowed } = await authorize(parsed.data.family_id);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do edycji osób." };
  const { data, error } = await supabase
    .from("people")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      preferred_name: parsed.data.preferred_name,
      biography: parsed.data.biography,
      avatar_path: parsed.data.avatar_path,
      birth_day: parsed.data.birth_day,
      birth_month: parsed.data.birth_month,
      birth_year: parsed.data.birth_year,
      birth_year_visible: parsed.data.birth_year_visible,
      is_living: parsed.data.is_living,
      is_placeholder: parsed.data.is_placeholder,
      privacy_level: parsed.data.privacy_level,
    })
    .eq("id", parsed.data.person_id)
    .eq("family_id", parsed.data.family_id)
    .eq("updated_at", parsed.data.expected_updated_at)
    .select("id")
    .maybeSingle();
  if (error) return { error: "Nie udało się zapisać osoby." };
  if (!data)
    return {
      error:
        "Osoba została zmieniona przez kogoś innego. Odśwież dane i spróbuj ponownie.",
    };
  revalidatePath(`/family/${parsed.data.family_id}/people`);
  revalidatePath(`/family/${parsed.data.family_id}/tree`);
  return { success: "Zmiany zostały zapisane." };
}

export async function archivePerson(
  _previous: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const familyId = String(formData.get("family_id") ?? "");
  const personId = String(formData.get("person_id") ?? "");
  const expectedUpdatedAt = String(formData.get("expected_updated_at") ?? "");
  const { supabase, user, allowed } = await authorize(familyId);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do archiwizowania osób." };
  const { data, error } = await supabase
    .from("people")
    .update({ archived_at: new Date().toISOString(), archived_by: user.id })
    .eq("id", personId)
    .eq("family_id", familyId)
    .eq("updated_at", expectedUpdatedAt)
    .is("archived_at", null)
    .select("id")
    .maybeSingle();
  if (error) return { error: "Nie udało się zarchiwizować osoby." };
  if (!data)
    return {
      error:
        "Osoba została zmieniona przez kogoś innego. Odśwież dane i spróbuj ponownie.",
    };
  revalidatePath(`/family/${familyId}/people`);
  revalidatePath(`/family/${familyId}/tree`);
  return { success: "Osoba została przeniesiona do archiwum." };
}
