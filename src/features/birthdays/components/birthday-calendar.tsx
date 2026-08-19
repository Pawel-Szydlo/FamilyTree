"use client";

import { Bell, Cake, ChevronLeft, ChevronRight, History } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Person } from "@/features/people/queries";
import { setBirthdayPreference } from "../actions";
import {
  type CalendarDate,
  daysInMonth,
  FAMILY_TIME_ZONE,
  formatBirthday,
  getMonthBirthday,
  weekday,
} from "../date";
import type {
  BirthdayEntry,
  BirthdayLog,
  BirthdayPreference,
} from "../queries";

const monthNames = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];
const personName = (person: Person) =>
  person.preferred_name ||
  [person.first_name, person.last_name].filter(Boolean).join(" ") ||
  "Osoba bez nazwy";

function effectiveEnabled(
  preferences: BirthdayPreference[],
  personId: string | null,
) {
  return (
    (
      preferences.find((preference) => preference.person_id === personId) ??
      preferences.find((preference) => preference.person_id === null)
    )?.enabled ?? true
  );
}

function PreferenceToggle({
  familyId,
  personId,
  initialEnabled,
  label,
}: {
  familyId: string;
  personId: string | null;
  initialEnabled: boolean;
  label: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  function toggle() {
    const next = !enabled;
    setEnabled(next);
    const data = new FormData();
    data.set("family_id", familyId);
    if (personId) data.set("person_id", personId);
    data.set("enabled", String(next));
    startTransition(() => {
      void setBirthdayPreference({}, data);
    });
  }
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={enabled}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-60"
    >
      <span className="truncate">{label}</span>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-background transition ${enabled ? "left-5" : "left-1"}`}
        />
      </span>
    </button>
  );
}

function daysLabel(days: number) {
  if (days === 0) return "Dzisiaj";
  if (days === 1) return "Jutro";
  return `Za ${days} dni`;
}

export function BirthdayCalendar({
  familyId,
  today,
  entries,
  people,
  preferences,
  logs,
}: {
  familyId: string;
  today: CalendarDate;
  entries: BirthdayEntry[];
  people: Person[];
  preferences: BirthdayPreference[];
  logs: BirthdayLog[];
}) {
  const [viewDate, setViewDate] = useState({
    year: today.year,
    month: today.month,
  });
  const { month, year } = viewDate;
  const changeMonth = (delta: number) => {
    setViewDate((current) => {
      const nextMonth = current.month + delta;
      if (nextMonth < 1) return { year: current.year - 1, month: 12 };
      if (nextMonth > 12) return { year: current.year + 1, month: 1 };
      return { year: current.year, month: nextMonth };
    });
  };
  const monthEntries = people
    .filter(
      (person) => person.birth_month === month && person.birth_day !== null,
    )
    .map((person) => ({
      person,
      date: getMonthBirthday(
        month,
        year,
        person.birth_month as number,
        person.birth_day as number,
      ),
    }))
    .filter(
      (entry): entry is { person: Person; date: CalendarDate } =>
        entry.date !== null,
    );
  const leadingDays = weekday(year, month, 1);
  const totalDays = daysInMonth(year, month);
  const leadingKeys = ["sun", "mon", "tue", "wed", "thu", "fri"].slice(
    0,
    leadingDays,
  );
  const next = entries.slice(0, 8);
  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.5fr_0.85fr]">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-accent text-primary">
              <Cake className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">
                Najbliższe urodziny
              </h2>
              <p className="text-sm text-muted-foreground">
                Strefa rodziny: {FAMILY_TIME_ZONE}
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {next.length ? (
              next.map((entry) => (
                <div
                  key={entry.person.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">
                      {personName(entry.person)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatBirthday(
                        entry.occurrence.month,
                        entry.occurrence.day,
                      )}{" "}
                      · {entry.relationLabel}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-primary">
                    {daysLabel(entry.occurrence.daysUntil)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                Brak zapisanych dat urodzin.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary/70">
                Widok miesięczny
              </p>
              <h2 className="text-xl font-semibold text-primary">
                {monthNames[month - 1]} {year}
              </h2>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => changeMonth(-1)}
                aria-label="Poprzedni miesiąc"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => changeMonth(1)}
                aria-label="Następny miesiąc"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"].map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
            {leadingKeys.map((key) => (
              <span key={key} />
            ))}
            {Array.from({ length: totalDays }, (_, index) => {
              const day = index + 1;
              const matches = monthEntries.filter(
                (entry) => entry.date.day === day,
              );
              return (
                <div
                  key={day}
                  className={`min-h-20 rounded-xl border p-1 text-left ${matches.length ? "border-primary/30 bg-accent/35" : "border-transparent bg-muted/30"}`}
                >
                  <span className="text-xs font-medium text-primary/70">
                    {day}
                  </span>
                  {matches.map((match) => (
                    <p
                      key={match.person.id}
                      className="mt-1 truncate rounded-md bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary"
                      title={`${personName(match.person)} · ${match.person.is_living ? "Żyjąca" : "Zmarła"}`}
                    >
                      {personName(match.person)}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
          {monthEntries.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Brak urodzin w tym miesiącu.
            </p>
          )}
        </section>
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
              <Bell className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">Powiadomienia</h2>
              <p className="text-sm text-muted-foreground">
                Globalnie i per osoba
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-border p-2">
            <PreferenceToggle
              familyId={familyId}
              personId={null}
              initialEnabled={effectiveEnabled(preferences, null)}
              label="Wszystkie urodziny"
            />
          </div>
          <div className="mt-3 max-h-56 space-y-1 overflow-y-auto">
            {people.map((person) => (
              <PreferenceToggle
                key={person.id}
                familyId={familyId}
                personId={person.id}
                initialEnabled={effectiveEnabled(preferences, person.id)}
                label={personName(person)}
              />
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <History className="size-4" />
              Historia wysyłki
            </div>
            <div className="mt-3 space-y-2">
              {logs.length ? (
                logs.slice(0, 5).map((log) => {
                  const logPerson = people.find(
                    (person) => person.id === log.person_id,
                  );
                  return (
                    <div key={log.id} className="text-xs text-muted-foreground">
                      <span>
                        {logPerson ? personName(logPerson) : ""}
                        {logPerson ? " · " : ""}
                        {log.notification_type === "birthday_today"
                          ? "Dzisiaj"
                          : "7 dni wcześniej"}{" "}
                        · {log.birthday_year} ·{" "}
                        {new Intl.DateTimeFormat("pl-PL", {
                          timeZone: FAMILY_TIME_ZONE,
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(log.sent_at))}
                      </span>
                      {log.error_message && (
                        <span className="ml-1 text-destructive">· błąd</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">
                  Brak wysłanych powiadomień.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
