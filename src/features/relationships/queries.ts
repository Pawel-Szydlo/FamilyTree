import type { Person } from "@/features/people/queries";
import { createClient } from "@/lib/supabase/server";

export type Partnership = {
  id: string;
  family_id: string;
  partnership_type: "marriage" | "partnership" | "relationship";
  status: "active" | "ended" | "divorced" | "widowed" | "unknown";
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  updated_at: string;
  members: {
    person_id: string;
    role: "partner" | "spouse" | "unknown";
    position: number;
  }[];
};
export type ParentLink = {
  id: string;
  family_id: string;
  parent_person_id: string | null;
  parent_partnership_id: string | null;
  child_person_id: string;
  relation_type:
    | "biological"
    | "adoptive"
    | "foster"
    | "step"
    | "guardian"
    | "unknown";
  status: "confirmed" | "probable" | "unknown";
  notes: string | null;
};

export async function getRelationshipData(familyId: string) {
  const supabase = await createClient();
  const [peopleResult, partnershipsResult, membersResult, linksResult] =
    await Promise.all([
      supabase
        .from("people")
        .select(
          "id, family_id, first_name, last_name, preferred_name, biography, avatar_path, birth_day, birth_month, birth_year, birth_year_visible, is_living, is_placeholder, privacy_level, archived_at, updated_at",
        )
        .eq("family_id", familyId)
        .is("archived_at", null)
        .order("last_name")
        .order("first_name"),
      supabase
        .from("partnerships")
        .select(
          "id, family_id, partnership_type, status, start_date, end_date, notes, updated_at",
        )
        .eq("family_id", familyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("partnership_members")
        .select("partnership_id, person_id, role, position")
        .order("position"),
      supabase
        .from("parent_links")
        .select(
          "id, family_id, parent_person_id, parent_partnership_id, child_person_id, relation_type, status, notes",
        )
        .eq("family_id", familyId),
    ]);
  if (peopleResult.error) throw peopleResult.error;
  if (partnershipsResult.error) throw partnershipsResult.error;
  if (membersResult.error) throw membersResult.error;
  if (linksResult.error) throw linksResult.error;
  const members = (membersResult.data ?? []).filter((member) =>
    (partnershipsResult.data ?? []).some(
      (partnership) => partnership.id === member.partnership_id,
    ),
  );
  return {
    people: (peopleResult.data ?? []) as Person[],
    partnerships: (partnershipsResult.data ?? []).map((partnership) => ({
      ...partnership,
      members: members
        .filter((member) => member.partnership_id === partnership.id)
        .map(({ partnership_id: _partnershipId, ...member }) => member),
    })) as Partnership[],
    parentLinks: (linksResult.data ?? []) as ParentLink[],
  };
}
