"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  contentHash,
  extensionForType,
  PRIVATE_BUCKET,
  parseMemoryForm,
} from "./schema";

export type MemoryActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
const editableRoles = ["owner", "admin", "editor"];

function validationState(
  issues: { path: PropertyKey[]; message: string }[],
): MemoryActionState {
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

function friendlyError(
  message: string,
  error: { message?: string } | null,
): MemoryActionState {
  const detail = error?.message?.toLowerCase() ?? "";
  if (
    detail.includes("duplicate") ||
    detail.includes("already exists") ||
    detail.includes("unique")
  )
    return { error: "To zdjęcie zostało już dodane do tej rodziny." };
  if (
    detail.includes("permission") ||
    detail.includes("policy") ||
    detail.includes("row-level")
  )
    return { error: "Nie masz dostępu do tej rodziny lub zdjęcia." };
  return { error: message };
}

async function peopleBelongToFamily(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string,
  personIds: string[],
) {
  if (!personIds.length) return true;
  const { data, error } = await supabase
    .from("people")
    .select("id")
    .eq("family_id", familyId)
    .is("archived_at", null)
    .in("id", personIds);
  return !error && (data?.length ?? 0) === new Set(personIds).size;
}

async function cleanupPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photoId: string | null,
  path: string | null,
) {
  if (path) await supabase.storage.from(PRIVATE_BUCKET).remove([path]);
  if (photoId) await supabase.from("photos").delete().eq("id", photoId);
}

export async function createMemory(
  _previous: MemoryActionState,
  formData: FormData,
): Promise<MemoryActionState> {
  const parsed = parseMemoryForm(formData);
  if (!parsed.success) return validationState(parsed.error.issues);
  const { supabase, user, allowed } = await authorize(parsed.data.family_id);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do dodawania wspomnień." };
  if (
    !(await peopleBelongToFamily(
      supabase,
      parsed.data.family_id,
      parsed.data.person_ids,
    ))
  )
    return { error: "Wybrana osoba nie należy do tej rodziny." };
  let storagePath: string | null = null;
  let photoId: string | null = null;
  const { data: memory, error: memoryError } = await supabase
    .from("memories")
    .insert({
      family_id: parsed.data.family_id,
      title: parsed.data.title,
      body: parsed.data.body,
      type: parsed.data.type,
      memory_date: parsed.data.memory_date,
      visibility: parsed.data.visibility,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (memoryError || !memory)
    return friendlyError("Nie udało się utworzyć wspomnienia.", memoryError);
  try {
    if (parsed.data.type === "photo" && parsed.data.file) {
      const hash = await contentHash(parsed.data.file);
      storagePath = `${parsed.data.family_id}/${hash}.${extensionForType(parsed.data.file.type)}`;
      const duplicate = await supabase
        .from("photos")
        .select("id")
        .eq("storage_path", storagePath)
        .maybeSingle();
      if (duplicate.data) {
        await supabase.from("memories").delete().eq("id", memory.id);
        return { error: "To zdjęcie zostało już dodane do tej rodziny." };
      }
      const upload = await supabase.storage
        .from(PRIVATE_BUCKET)
        .upload(storagePath, parsed.data.file, {
          contentType: parsed.data.file.type,
          upsert: false,
        });
      if (upload.error) throw upload.error;
      const photo = await supabase
        .from("photos")
        .insert({
          family_id: parsed.data.family_id,
          storage_path: storagePath,
          visibility: parsed.data.visibility,
          uploaded_by: user.id,
        })
        .select("id")
        .single();
      if (photo.error || !photo.data)
        throw photo.error ?? new Error("Photo record missing");
      photoId = photo.data.id;
      const linkedMemory = await supabase
        .from("memories")
        .update({ photo_id: photoId })
        .eq("id", memory.id);
      if (linkedMemory.error) throw linkedMemory.error;
      if (parsed.data.person_ids.length) {
        const photoLinks = await supabase.from("photo_people").insert(
          parsed.data.person_ids.map((person_id) => ({
            photo_id: photoId,
            person_id,
          })),
        );
        if (photoLinks.error) throw photoLinks.error;
      }
    }
    if (parsed.data.person_ids.length) {
      const links = await supabase.from("memory_people").insert(
        parsed.data.person_ids.map((person_id) => ({
          memory_id: memory.id,
          person_id,
        })),
      );
      if (links.error) throw links.error;
    }
  } catch (error) {
    await cleanupPhoto(supabase, photoId, storagePath);
    await supabase.from("memories").delete().eq("id", memory.id);
    return friendlyError(
      "Nie udało się zapisać wspomnienia lub zdjęcia.",
      error as { message?: string },
    );
  }
  revalidatePath(`/family/${parsed.data.family_id}/memories`);
  return { success: "Wspomnienie zostało dodane." };
}

export async function deleteMemory(
  _previous: MemoryActionState,
  formData: FormData,
): Promise<MemoryActionState> {
  const familyId = String(formData.get("family_id") ?? "");
  const memoryId = String(formData.get("memory_id") ?? "");
  const { supabase, user, allowed } = await authorize(familyId);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do usuwania wspomnień." };
  const { data: memory, error } = await supabase
    .from("memories")
    .select("photo_id")
    .eq("family_id", familyId)
    .eq("id", memoryId)
    .maybeSingle();
  if (error || !memory)
    return {
      error: "Wspomnienie nie istnieje albo nie masz do niego dostępu.",
    };
  let path: string | null = null;
  if (memory.photo_id) {
    const photo = await supabase
      .from("photos")
      .select("storage_path")
      .eq("family_id", familyId)
      .eq("id", memory.photo_id)
      .maybeSingle();
    path = photo.data?.storage_path ?? null;
    if (path) {
      const removed = await supabase.storage
        .from(PRIVATE_BUCKET)
        .remove([path]);
      if (
        removed.error &&
        !removed.error.message.toLowerCase().includes("not found")
      )
        return { error: "Nie udało się usunąć pliku zdjęcia." };
    }
    const deletedPhoto = await supabase
      .from("photos")
      .delete()
      .eq("id", memory.photo_id);
    if (deletedPhoto.error)
      return friendlyError(
        "Nie udało się usunąć rekordu zdjęcia.",
        deletedPhoto.error,
      );
  }
  const deleted = await supabase
    .from("memories")
    .delete()
    .eq("family_id", familyId)
    .eq("id", memoryId);
  if (deleted.error)
    return friendlyError("Nie udało się usunąć wspomnienia.", deleted.error);
  revalidatePath(`/family/${familyId}/memories`);
  return { success: "Wspomnienie zostało usunięte." };
}

export async function deletePhoto(
  _previous: MemoryActionState,
  formData: FormData,
): Promise<MemoryActionState> {
  const familyId = String(formData.get("family_id") ?? "");
  const photoId = String(formData.get("photo_id") ?? "");
  const { supabase, user, allowed } = await authorize(familyId);
  if (!user) return { error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!allowed) return { error: "Nie masz uprawnień do usuwania zdjęć." };
  const { data: photo } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("family_id", familyId)
    .eq("id", photoId)
    .maybeSingle();
  if (!photo)
    return { error: "Zdjęcie nie istnieje albo nie masz do niego dostępu." };
  const removed = await supabase.storage
    .from(PRIVATE_BUCKET)
    .remove([photo.storage_path]);
  if (
    removed.error &&
    !removed.error.message.toLowerCase().includes("not found")
  )
    return { error: "Nie udało się usunąć pliku zdjęcia." };
  const deleted = await supabase
    .from("photos")
    .delete()
    .eq("family_id", familyId)
    .eq("id", photoId);
  if (deleted.error)
    return friendlyError("Nie udało się usunąć zdjęcia.", deleted.error);
  revalidatePath(`/family/${familyId}/memories`);
  return { success: "Zdjęcie zostało usunięte." };
}
