import { describe, expect, it } from "vitest";
import { getFamilyDate, getMonthBirthday, getNextBirthday } from "./date";

describe("birthday calendar dates", () => {
  it("recognizes a birthday today", () => {
    expect(getNextBirthday(5, 20, { year: 2026, month: 5, day: 20 })).toEqual({
      year: 2026,
      month: 5,
      day: 20,
      daysUntil: 0,
    });
  });

  it("calculates a birthday seven days ahead", () => {
    expect(
      getNextBirthday(5, 27, { year: 2026, month: 5, day: 20 }).daysUntil,
    ).toBe(7);
  });

  it("rolls the next birthday into the following year", () => {
    expect(getNextBirthday(1, 2, { year: 2026, month: 12, day: 30 })).toEqual({
      year: 2027,
      month: 1,
      day: 2,
      daysUntil: 3,
    });
  });

  it("treats February 29 as February 28 in a non-leap year", () => {
    expect(
      getNextBirthday(2, 29, { year: 2025, month: 2, day: 27 }),
    ).toMatchObject({ year: 2025, month: 2, day: 28, daysUntil: 1 });
    expect(
      getNextBirthday(2, 29, { year: 2024, month: 2, day: 29 }).daysUntil,
    ).toBe(0);
    expect(getMonthBirthday(2, 2025, 2, 29)).toEqual({
      year: 2025,
      month: 2,
      day: 28,
    });
  });

  it("keeps birthdays without a year as month/day values", () => {
    expect(
      getNextBirthday(8, 14, { year: 2026, month: 8, day: 15 }),
    ).toMatchObject({ month: 8, day: 14, year: 2027 });
  });

  it("extracts the family date without converting the birthday through UTC", () => {
    expect(getFamilyDate(new Date("2026-01-01T23:30:00.000Z"))).toEqual({
      year: 2026,
      month: 1,
      day: 2,
    });
  });
});
