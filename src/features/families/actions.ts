"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateFamilyState = { error?: string };

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "moja-rodzina"
  );
}

export async function createFamily(
  _previousState: CreateFamilyState,
  formData: FormData,
): Promise<CreateFamilyState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 120)
    return { error: "Nazwa rodziny musi mieć od 2 do 120 znaków." };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Sesja wygasła. Zaloguj się ponownie." };

  const familyId = crypto.randomUUID();
  const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`;
  const { error } = await supabase.from("families").insert({
    id: familyId,
    name,
    slug,
    created_by: authData.user.id,
  });
  if (error)
    return { error: "Nie udało się utworzyć rodziny. Spróbuj ponownie." };
  redirect(`/family/${familyId}/tree`);
}
