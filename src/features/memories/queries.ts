import type { Person } from "@/features/people/queries";
import { createClient } from "@/lib/supabase/server";
import { PRIVATE_BUCKET } from "./schema";

export type MemoryType = "photo" | "story" | "event";
export type MemoryPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  taken_at: string | null;
  signed_url: string | null;
  person_ids: string[];
};
export type MemoryRecord = {
  id: string;
  family_id: string;
  title: string;
  body: string | null;
  type: MemoryType;
  memory_date: string | null;
  visibility: "family" | "restricted" | "private";
  created_at: string;
  updated_at: string;
  person_ids: string[];
  photo: MemoryPhoto | null;
};

export async function getMemories(familyId: string): Promise<MemoryRecord[]> {
  const supabase = await createClient();
  const [memoriesResult, photosResult, memoryPeopleResult, photoPeopleResult] =
    await Promise.all([
      supabase
        .from("memories")
        .select(
          "id, family_id, title, body, type, memory_date, visibility, photo_id, created_at, updated_at",
        )
        .eq("family_id", familyId)
        .order("memory_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("photos")
        .select("id, family_id, storage_path, caption, taken_at")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false }),
      supabase.from("memory_people").select("memory_id, person_id"),
      supabase.from("photo_people").select("photo_id, person_id"),
    ]);
  if (memoriesResult.error) throw memoriesResult.error;
  if (photosResult.error) throw photosResult.error;
  if (memoryPeopleResult.error) throw memoryPeopleResult.error;
  if (photoPeopleResult.error) throw photoPeopleResult.error;
  const photoIds = new Set((photosResult.data ?? []).map((photo) => photo.id));
  const photos = await Promise.all(
    (photosResult.data ?? []).map(async (photo) => {
      const signed = await supabase.storage
        .from(PRIVATE_BUCKET)
        .createSignedUrl(photo.storage_path, 60 * 60);
      return {
        ...photo,
        signed_url: signed.data?.signedUrl ?? null,
        person_ids: (photoPeopleResult.data ?? [])
          .filter((link) => link.photo_id === photo.id)
          .map((link) => link.person_id),
      };
    }),
  );
  return (memoriesResult.data ?? []).map((memory) => ({
    ...memory,
    person_ids: (memoryPeopleResult.data ?? [])
      .filter((link) => link.memory_id === memory.id)
      .map((link) => link.person_id),
    photo:
      memory.photo_id && photoIds.has(memory.photo_id)
        ? (photos.find((photo) => photo.id === memory.photo_id) ?? null)
        : null,
  })) as MemoryRecord[];
}

export async function getMemoryPeople(familyId: string): Promise<Person[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people_visible")
    .select(
      "id, family_id, first_name, last_name, preferred_name, biography, avatar_path, birth_day, birth_month, birth_year, birth_year_visible, is_living, is_placeholder, privacy_level, archived_at, updated_at",
    )
    .eq("family_id", familyId)
    .is("archived_at", null)
    .order("last_name")
    .order("first_name");
  if (error) throw error;
  return (data ?? []) as Person[];
}
