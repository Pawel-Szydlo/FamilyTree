import { createServiceClient } from "../../lib/supabase/service";
import {
  type CalendarDate,
  getFamilyDate,
  getNextBirthday,
} from "../birthdays/date";
import { type ReminderType, sendBirthdayEmail } from "./email";

type PersonRow = {
  id: string;
  family_id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  birth_month: number | null;
  birth_day: number | null;
  archived_at: string | null;
};
type MemberRow = { family_id: string; user_id: string };
type PreferenceRow = {
  family_id: string;
  user_id: string;
  person_id: string | null;
  enabled: boolean;
  notify_7_days_before: boolean;
  notify_on_day: boolean;
};
type FamilyRow = { id: string; name: string };
type UserRow = { email?: string | null };

export type NotificationRunResult = {
  date: CalendarDate;
  considered: number;
  sent: number;
  failed: number;
  skipped: number;
};

function personName(person: PersonRow) {
  return (
    person.preferred_name ||
    [person.first_name, person.last_name].filter(Boolean).join(" ") ||
    "Osoba w rodzinie"
  );
}

function safeError(error: unknown) {
  return error instanceof Error
    ? error.message.slice(0, 500)
    : "Unknown delivery error.";
}

function preferenceEnabled(
  preferences: PreferenceRow[],
  familyId: string,
  userId: string,
  personId: string,
  type: ReminderType,
) {
  const scoped =
    preferences.find(
      (item) =>
        item.family_id === familyId &&
        item.user_id === userId &&
        item.person_id === personId,
    ) ??
    preferences.find(
      (item) =>
        item.family_id === familyId &&
        item.user_id === userId &&
        item.person_id === null,
    );
  if (!scoped) return true;
  return (
    scoped.enabled &&
    (type === "birthday_today"
      ? scoped.notify_on_day
      : scoped.notify_7_days_before)
  );
}

async function getUserEmail(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
) {
  const result = await supabase.auth.admin.getUserById(userId);
  if (result.error) throw new Error("Recipient lookup failed.");
  return (result.data.user as UserRow | null)?.email ?? null;
}

export async function sendBirthdayNotifications(
  today = getFamilyDate(),
): Promise<NotificationRunResult> {
  const supabase = createServiceClient();
  const [peopleResult, membersResult, preferencesResult, familiesResult] =
    await Promise.all([
      supabase
        .from("people")
        .select(
          "id, family_id, first_name, last_name, preferred_name, birth_month, birth_day, archived_at",
        )
        .is("archived_at", null),
      supabase
        .from("family_members")
        .select("family_id, user_id")
        .eq("status", "active"),
      supabase
        .from("notification_preferences")
        .select(
          "family_id, user_id, person_id, enabled, notify_7_days_before, notify_on_day",
        ),
      supabase.from("families").select("id, name"),
    ]);
  for (const result of [
    peopleResult,
    membersResult,
    preferencesResult,
    familiesResult,
  ]) {
    if (result.error) throw result.error;
  }

  const people = (peopleResult.data ?? []) as PersonRow[];
  const members = (membersResult.data ?? []) as MemberRow[];
  const preferences = (preferencesResult.data ?? []) as PreferenceRow[];
  const families = new Map(
    (familiesResult.data ?? []).map((family) => {
      const item = family as FamilyRow;
      return [item.id, item.name] as const;
    }),
  );
  const emails = new Map<string, string | null>();
  const result: NotificationRunResult = {
    date: today,
    considered: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const person of people) {
    if (person.birth_month === null || person.birth_day === null) continue;
    const occurrence = getNextBirthday(
      person.birth_month,
      person.birth_day,
      today,
    );
    const type: ReminderType | null =
      occurrence.daysUntil === 0
        ? "birthday_today"
        : occurrence.daysUntil === 7
          ? "birthday_7_days"
          : null;
    if (!type) continue;
    for (const member of members.filter(
      (item) => item.family_id === person.family_id,
    )) {
      result.considered += 1;
      if (
        !preferenceEnabled(
          preferences,
          person.family_id,
          member.user_id,
          person.id,
          type,
        )
      ) {
        result.skipped += 1;
        continue;
      }
      const claim = await supabase
        .from("notification_logs")
        .insert({
          family_id: person.family_id,
          recipient_user_id: member.user_id,
          person_id: person.id,
          notification_type: type,
          birthday_year: occurrence.year,
          error_message: null,
        })
        .select("id");
      if (claim.error) {
        if (claim.error.code === "23505") result.skipped += 1;
        else result.failed += 1;
        continue;
      }
      const logId = (claim.data as Array<{ id?: string }> | null)?.[0]?.id;
      try {
        if (!emails.has(member.user_id)) {
          emails.set(
            member.user_id,
            await getUserEmail(supabase, member.user_id),
          );
        }
        const recipient = emails.get(member.user_id);
        if (!recipient) throw new Error("Recipient email is missing.");
        const resendId = await sendBirthdayEmail({
          recipient,
          personName: personName(person),
          familyName: families.get(person.family_id) ?? "Rodzina",
          month: occurrence.month,
          day: occurrence.day,
          year: occurrence.year,
          type,
        });
        if (logId) {
          await supabase
            .from("notification_logs")
            .update({ delivery_status: "sent", resend_message_id: resendId })
            .eq("id", logId);
        }
        result.sent += 1;
      } catch (error) {
        if (logId) {
          await supabase
            .from("notification_logs")
            .update({
              delivery_status: "failed",
              error_message: safeError(error),
            })
            .eq("id", logId);
        }
        result.failed += 1;
      }
    }
  }
  return result;
}
