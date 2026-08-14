import { createClient } from "@/lib/supabase/server";

export type FamilySummary = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getFamilies(): Promise<FamilySummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("families")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FamilySummary[];
}

export async function getFamilyById(
  familyId: string,
): Promise<FamilySummary | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("families")
    .select("id, name, slug, created_at")
    .eq("id", familyId)
    .maybeSingle();
  return (data as FamilySummary | null) ?? null;
}
