import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(max).nullable().optional(),
  );

const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? null
      : Number(value),
  z.number().int().nullable(),
);

export const personSchema = z
  .object({
    first_name: z.string().trim().max(120).default(""),
    last_name: z.string().trim().max(120).default(""),
    preferred_name: optionalText(120),
    biography: optionalText(10_000),
    avatar_path: optionalText(1_000),
    birth_day: optionalNumber.pipe(z.number().int().min(1).max(31).nullable()),
    birth_month: optionalNumber.pipe(
      z.number().int().min(1).max(12).nullable(),
    ),
    birth_year: optionalNumber.pipe(
      z.number().int().min(1).max(3000).nullable(),
    ),
    birth_year_visible: z.coerce.boolean().default(false),
    is_living: z.coerce.boolean().default(true),
    is_placeholder: z.coerce.boolean().default(false),
    privacy_level: z
      .enum(["family", "restricted", "private"])
      .default("family"),
  })
  .superRefine((value, ctx) => {
    if (
      !value.is_placeholder &&
      !`${value.first_name} ${value.last_name}`.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["first_name"],
        message: "Podaj imię lub nazwisko.",
      });
    }
    if ((value.birth_day === null) !== (value.birth_month === null)) {
      ctx.addIssue({
        code: "custom",
        path: ["birth_day"],
        message: "Dzień i miesiąc urodzenia muszą występować razem.",
      });
    }
    if (value.birth_day !== null && value.birth_month !== null) {
      const daysInMonth = new Date(
        value.birth_year ?? 2024,
        value.birth_month,
        0,
      ).getDate();
      if (value.birth_day > daysInMonth) {
        ctx.addIssue({
          code: "custom",
          path: ["birth_day"],
          message: "Podana data urodzenia nie istnieje.",
        });
      }
    }
    if (value.birth_year === null && value.birth_year_visible) {
      ctx.addIssue({
        code: "custom",
        path: ["birth_year_visible"],
        message: "Nie można pokazać niepodanego roku.",
      });
    }
    if (
      value.is_living &&
      value.birth_year !== null &&
      !value.birth_year_visible
    ) {
      // Privacy-by-default: a living person's year cannot be accidentally exposed.
      ctx.addIssue({
        code: "custom",
        path: ["birth_year_visible"],
        message: "Rok żyjącej osoby musi być oznaczony jako widoczny.",
      });
    }
  });

export type PersonInput = z.infer<typeof personSchema>;

export const personFormSchema = personSchema.extend({
  family_id: z.string().uuid(),
  person_id: z.string().uuid().optional(),
  expected_updated_at: z.string().datetime().optional(),
});

export function parsePersonForm(formData: FormData) {
  return personFormSchema.safeParse({
    family_id: formData.get("family_id"),
    person_id: formData.get("person_id") || undefined,
    expected_updated_at: formData.get("expected_updated_at") || undefined,
    first_name: formData.get("first_name") ?? "",
    last_name: formData.get("last_name") ?? "",
    preferred_name: formData.get("preferred_name"),
    biography: formData.get("biography"),
    avatar_path: formData.get("avatar_path"),
    birth_day: formData.get("birth_day"),
    birth_month: formData.get("birth_month"),
    birth_year: formData.get("birth_year"),
    birth_year_visible: formData.get("birth_year_visible") === "on",
    is_living: formData.get("is_living") === "on",
    is_placeholder: formData.get("is_placeholder") === "on",
    privacy_level: formData.get("privacy_level") ?? "family",
  });
}
