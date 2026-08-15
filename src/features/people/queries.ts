import { createClient } from "@/lib/supabase/server";

export type Person = {
  id: string;
  family_id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  biography: string | null;
  avatar_path: string | null;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  birth_year_visible: boolean;
  is_living: boolean;
  is_placeholder: boolean;
  privacy_level: "family" | "restricted" | "private";
  archived_at: string | null;
  updated_at: string;
};

const columns =
  "id, family_id, first_name, last_name, preferred_name, biography, avatar_path, birth_day, birth_month, birth_year, birth_year_visible, is_living, is_placeholder, privacy_level, archived_at, updated_at";

export async function getPeople(familyId: string): Promise<Person[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select(columns)
    .eq("family_id", familyId)
    .is("archived_at", null)
    .order("last_name")
    .order("first_name");
  if (error) throw error;
  return (data ?? []) as Person[];
}

export async function getPerson(
  familyId: string,
  personId: string,
): Promise<Person | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select(columns)
    .eq("family_id", familyId)
    .eq("id", personId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as Person | null) ?? null;
}
