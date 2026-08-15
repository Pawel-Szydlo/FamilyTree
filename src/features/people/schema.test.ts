import { describe, expect, it } from "vitest";
import { personSchema } from "./schema";

const valid = {
  first_name: "Anna",
  last_name: "Kowalska",
  birth_day: null,
  birth_month: null,
  birth_year: null,
  birth_year_visible: false,
  is_living: true,
  is_placeholder: false,
  privacy_level: "family" as const,
};

describe("personSchema", () => {
  it("accepts living and deceased people", () => {
    expect(personSchema.safeParse(valid).success).toBe(true);
    expect(
      personSchema.safeParse({
        ...valid,
        is_living: false,
        birth_year: 1930,
        birth_year_visible: false,
      }).success,
    ).toBe(true);
  });

  it("accepts a placeholder without a name", () => {
    expect(
      personSchema.safeParse({
        ...valid,
        first_name: "",
        last_name: "",
        is_placeholder: true,
      }).success,
    ).toBe(true);
  });

  it("supports a day and month without manufacturing a year", () => {
    const result = personSchema.safeParse({
      ...valid,
      birth_day: 12,
      birth_month: 4,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.birth_year).toBeNull();
  });

  it("rejects impossible dates and unnamed non-placeholders", () => {
    expect(
      personSchema.safeParse({ ...valid, birth_day: 31, birth_month: 2 })
        .success,
    ).toBe(false);
    expect(
      personSchema.safeParse({ ...valid, first_name: "", last_name: "" })
        .success,
    ).toBe(false);
  });
});
