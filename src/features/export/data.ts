import { createClient } from "@/lib/supabase/server";
import type { ExportData } from "./format";

export async function getExportData(
  familyId: string,
): Promise<ExportData | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const membership = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!membership.data) return null;

  const [
    people,
    partnerships,
    partnershipMembers,
    parentLinks,
    memories,
    memoryPeople,
    photos,
    photoPeople,
  ] = await Promise.all([
    supabase
      .from("people_visible")
      .select(
        "id, family_id, first_name, last_name, preferred_name, biography, birth_day, birth_month, birth_year, birth_year_visible, is_living, is_placeholder, privacy_level",
      )
      .eq("family_id", familyId)
      .is("archived_at", null),
    supabase
      .from("partnerships")
      .select(
        "id, family_id, partnership_type, status, start_date, end_date, notes",
      )
      .eq("family_id", familyId),
    supabase
      .from("partnership_members")
      .select("partnership_id, person_id, role, position"),
    supabase
      .from("parent_links")
      .select(
        "id, family_id, parent_person_id, parent_partnership_id, child_person_id, relation_type, status, notes",
      )
      .eq("family_id", familyId),
    supabase
      .from("memories")
      .select(
        "id, family_id, type, title, body, memory_date, visibility, photo_id, created_at, updated_at",
      )
      .eq("family_id", familyId),
    supabase.from("memory_people").select("memory_id, person_id"),
    supabase
      .from("photos")
      .select(
        "id, family_id, caption, taken_at, visibility, created_at, storage_path",
      )
      .eq("family_id", familyId),
    supabase.from("photo_people").select("photo_id, person_id"),
  ]);
  for (const result of [
    people,
    partnerships,
    partnershipMembers,
    parentLinks,
    memories,
    memoryPeople,
    photos,
    photoPeople,
  ]) {
    if (result.error) throw result.error;
  }
  return {
    exported_at: new Date().toISOString(),
    family_id: familyId,
    people: (people.data ?? []) as ExportData["people"],
    partnerships: (partnerships.data ?? []) as Record<string, unknown>[],
    partnership_members: (partnershipMembers.data ?? []) as Record<
      string,
      unknown
    >[],
    parent_links: (parentLinks.data ?? []) as Record<string, unknown>[],
    memories: (memories.data ?? []) as Record<string, unknown>[],
    memory_people: (memoryPeople.data ?? []) as Record<string, unknown>[],
    photos: (photos.data ?? []) as ExportData["photos"],
    photo_people: (photoPeople.data ?? []) as Record<string, unknown>[],
  };
}
