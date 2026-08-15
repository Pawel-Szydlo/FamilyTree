import { z } from "zod";

export const PRIVATE_BUCKET = "family-private";
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
export const PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const nullableText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(max).nullable().optional(),
  );
const nullableDate = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().date().nullable().optional(),
);
const optionalFile = z.preprocess(
  (value) =>
    typeof File !== "undefined" && value instanceof File && value.size === 0
      ? null
      : value,
  z.custom<File | null>(
    (value) =>
      value === null || (typeof File !== "undefined" && value instanceof File),
    "Wybierz poprawny plik.",
  ),
);

export const memorySchema = z
  .object({
    family_id: z.string().uuid(),
    memory_id: z.string().uuid().optional(),
    title: z.string().trim().min(1, "Podaj tytuł.").max(200),
    body: nullableText(30_000),
    type: z.enum(["photo", "story", "event"]),
    memory_date: nullableDate,
    visibility: z.enum(["family", "restricted", "private"]),
    person_ids: z.array(z.string().uuid()),
    file: optionalFile,
  })
  .superRefine((value, ctx) => {
    if (new Set(value.person_ids).size !== value.person_ids.length)
      ctx.addIssue({
        code: "custom",
        path: ["person_ids"],
        message: "Osoba może być przypisana tylko raz.",
      });
    if (value.type === "photo") {
      if (!value.file)
        ctx.addIssue({
          code: "custom",
          path: ["file"],
          message: "Wspomnienie zdjęciowe wymaga pliku.",
        });
      else {
        if (
          !PHOTO_TYPES.includes(value.file.type as (typeof PHOTO_TYPES)[number])
        )
          ctx.addIssue({
            code: "custom",
            path: ["file"],
            message: "Dozwolone są JPG, PNG, WebP lub GIF.",
          });
        if (value.file.size > MAX_PHOTO_SIZE)
          ctx.addIssue({
            code: "custom",
            path: ["file"],
            message: "Zdjęcie może mieć maksymalnie 10 MB.",
          });
      }
    }
  });

export type MemoryInput = z.infer<typeof memorySchema>;

export function parseMemoryForm(formData: FormData) {
  return memorySchema.safeParse({
    family_id: formData.get("family_id"),
    memory_id: formData.get("memory_id") || undefined,
    title: formData.get("title"),
    body: formData.get("body"),
    type: formData.get("type"),
    memory_date: formData.get("memory_date"),
    visibility: formData.get("visibility"),
    person_ids: formData.getAll("person_ids"),
    file: formData.get("file"),
  });
}

export function extensionForType(type: string) {
  return (
    (
      {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      } as Record<string, string>
    )[type] ?? "bin"
  );
}

export async function contentHash(file: File) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
