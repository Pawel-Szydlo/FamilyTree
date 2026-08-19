import type { Person } from "@/features/people/queries";
import { getRelationshipData } from "@/features/relationships/queries";
import { createClient } from "@/lib/supabase/server";
import {
  type BirthdayOccurrence,
  FAMILY_TIME_ZONE,
  getFamilyDate,
  getNextBirthday,
} from "./date";

export type BirthdayPreference = {
  id?: string;
  person_id: string | null;
  enabled: boolean;
  notify_7_days_before: boolean;
  notify_on_day: boolean;
};
export type BirthdayLog = {
  id: string;
  person_id: string;
  notification_type: "birthday_7_days" | "birthday_today";
  birthday_year: number;
  sent_at: string;
  error_message: string | null;
};
export type BirthdayEntry = {
  person: Person;
  occurrence: BirthdayOccurrence;
  relationLabel: string;
};

function relationLabel(
  personId: string,
  data: Awaited<ReturnType<typeof getRelationshipData>>,
) {
  const labels = new Set<string>();
  if (
    data.parentLinks.some(
      (link) =>
        link.parent_person_id === personId ||
        (link.parent_partnership_id &&
          data.partnerships.some(
            (partnership) =>
              partnership.id === link.parent_partnership_id &&
              partnership.members.some(
                (member) => member.person_id === personId,
              ),
          )),
    )
  )
    labels.add("Rodzic");
  if (data.parentLinks.some((link) => link.child_person_id === personId))
    labels.add("Dziecko");
  if (
    data.partnerships.some((partnership) =>
      partnership.members.some((member) => member.person_id === personId),
    )
  )
    labels.add("Partner");
  return labels.size ? [...labels].join(" · ") : "Osoba w rodzinie";
}

export async function getBirthdayData(familyId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user)
    return {
      today: getFamilyDate(),
      timeZone: FAMILY_TIME_ZONE,
      entries: [],
      people: [],
      preferences: [],
      logs: [],
    };
  const [relationshipData, preferenceResult, logResult] = await Promise.all([
    getRelationshipData(familyId),
    supabase
      .from("notification_preferences")
      .select("id, person_id, enabled, notify_7_days_before, notify_on_day")
      .eq("family_id", familyId)
      .eq("user_id", auth.user.id),
    supabase
      .from("notification_logs")
      .select(
        "id, person_id, notification_type, birthday_year, sent_at, error_message",
      )
      .eq("family_id", familyId)
      .order("sent_at", { ascending: false })
      .limit(20),
  ]);
  if (preferenceResult.error) throw preferenceResult.error;
  if (logResult.error) throw logResult.error;
  const today = getFamilyDate();
  const people = relationshipData.people.filter(
    (person) => person.birth_month !== null && person.birth_day !== null,
  );
  return {
    today,
    timeZone: FAMILY_TIME_ZONE,
    people,
    entries: people
      .map((person) => ({
        person,
        occurrence: getNextBirthday(
          person.birth_month as number,
          person.birth_day as number,
          today,
        ),
        relationLabel: relationLabel(person.id, relationshipData),
      }))
      .sort(
        (a, b) => a.occurrence.daysUntil - b.occurrence.daysUntil,
      ) as BirthdayEntry[],
    preferences: (preferenceResult.data ?? []) as BirthdayPreference[],
    logs: (logResult.data ?? []) as BirthdayLog[],
  };
}
