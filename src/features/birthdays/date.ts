export const FAMILY_TIME_ZONE = "Europe/Warsaw";

export type CalendarDate = { year: number; month: number; day: number };
export type BirthdayOccurrence = CalendarDate & { daysUntil: number };

export function getFamilyDate(now = new Date()): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FAMILY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

export function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function normalizeBirthday(
  year: number,
  month: number,
  day: number,
): CalendarDate {
  return {
    year,
    month,
    day: month === 2 && day === 29 && !isLeapYear(year) ? 28 : day,
  };
}

function dayOfYear(date: CalendarDate) {
  let result = date.day;
  for (let month = 1; month < date.month; month += 1)
    result += daysInMonth(date.year, month);
  return result;
}

function daysBeforeYear(year: number) {
  const y = year - 1;
  return (
    365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)
  );
}

function ordinal(date: CalendarDate) {
  return daysBeforeYear(date.year) + dayOfYear(date);
}

export function getNextBirthday(
  month: number,
  day: number,
  today: CalendarDate,
): BirthdayOccurrence {
  let year = today.year;
  let candidate = normalizeBirthday(year, month, day);
  if (ordinal(candidate) < ordinal(today)) {
    year += 1;
    candidate = normalizeBirthday(year, month, day);
  }
  return { ...candidate, daysUntil: ordinal(candidate) - ordinal(today) };
}

export function getMonthBirthday(
  month: number,
  year: number,
  birthMonth: number,
  birthDay: number,
): CalendarDate | null {
  if (month !== birthMonth) return null;
  const day = normalizeBirthday(year, birthMonth, birthDay).day;
  return { year, month, day };
}

// Sakamoto's algorithm works on calendar fields and does not involve a timezone.
export function weekday(year: number, month: number, day: number) {
  const table = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const adjustedYear = month < 3 ? year - 1 : year;
  return (
    (adjustedYear +
      Math.floor(adjustedYear / 4) -
      Math.floor(adjustedYear / 100) +
      Math.floor(adjustedYear / 400) +
      table[month - 1] +
      day) %
    7
  );
}

export function formatBirthday(month: number, day: number) {
  return `${day}.${String(month).padStart(2, "0")}`;
}
