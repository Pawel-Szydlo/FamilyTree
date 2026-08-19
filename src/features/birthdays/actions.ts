"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BirthdayActionState = { error?: string; success?: string };

export async function setBirthdayPreference(
  _previous: BirthdayActionState,
  formData: FormData,
): Promise<BirthdayActionState> {
  const familyId = String(formData.get("family_id") ?? "");
  const personIdValue = String(formData.get("person_id") ?? "");
  const personId = personIdValue || null;
  const enabled = String(formData.get("enabled") ?? "false") === "true";
  const notify7Days =
    String(formData.get("notify_7_days_before") ?? "true") === "true";
  const notifyOnDay =
    String(formData.get("notify_on_day") ?? "true") === "true";
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  const membership = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!membership.data) return { error: "Nie masz dostępu do tej rodziny." };
  if (personId) {
    const person = await supabase
      .from("people")
      .select("id")
      .eq("family_id", familyId)
      .eq("id", personId)
      .maybeSingle();
    if (!person.data) return { error: "Osoba nie należy do tej rodziny." };
  }
  let existing = supabase
    .from("notification_preferences")
    .select("id")
    .eq("family_id", familyId)
    .eq("user_id", auth.user.id);
  existing = personId
    ? existing.eq("person_id", personId)
    : existing.is("person_id", null);
  const current = await existing.maybeSingle();
  if (current.error) return { error: "Nie udało się odczytać preferencji." };
  const values = {
    family_id: familyId,
    user_id: auth.user.id,
    person_id: personId,
    enabled,
    notify_7_days_before: notify7Days,
    notify_on_day: notifyOnDay,
  };
  const result = current.data
    ? await supabase
        .from("notification_preferences")
        .update(values)
        .eq("id", current.data.id)
    : await supabase.from("notification_preferences").insert(values);
  if (result.error) return { error: "Nie udało się zapisać preferencji." };
  revalidatePath(`/family/${familyId}/calendar`);
  return { success: "Preferencje zapisane." };
}
