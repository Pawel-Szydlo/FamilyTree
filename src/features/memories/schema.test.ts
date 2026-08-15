import { describe, expect, it } from "vitest";
import { MAX_PHOTO_SIZE, memorySchema, parseMemoryForm } from "./schema";

const familyId = "11111111-1111-4111-8111-111111111111";
const people = [
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
];

function form(values: Record<string, string | string[] | File>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const item of Array.isArray(value) ? value : [value])
      data.append(key, item);
  }
  return data;
}

describe("memory schema", () => {
  it("accepts a photo with many people and preserves the relation list", () => {
    const result = parseMemoryForm(
      form({
        family_id: familyId,
        title: "Wakacje",
        type: "photo",
        visibility: "family",
        person_ids: people,
        file: new File(["photo"], "beach.jpg", { type: "image/jpeg" }),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.person_ids).toEqual(people);
  });

  it("rejects a missing photo, unsupported type and oversized upload", () => {
    expect(
      memorySchema.safeParse({
        family_id: familyId,
        title: "Brak",
        type: "photo",
        visibility: "family",
        person_ids: [],
        file: null,
      }).success,
    ).toBe(false);
    expect(
      memorySchema.safeParse({
        family_id: familyId,
        title: "PDF",
        type: "photo",
        visibility: "family",
        person_ids: [],
        file: new File(["pdf"], "file.pdf", { type: "application/pdf" }),
      }).success,
    ).toBe(false);
    expect(
      memorySchema.safeParse({
        family_id: familyId,
        title: "Duże",
        type: "photo",
        visibility: "family",
        person_ids: [],
        file: { type: "image/jpeg", size: MAX_PHOTO_SIZE + 1 },
      }).success,
    ).toBe(false);
  });

  it("allows stories and events without a file or people", () => {
    expect(
      memorySchema.safeParse({
        family_id: familyId,
        title: "Historia",
        type: "story",
        visibility: "private",
        person_ids: [],
        file: null,
      }).success,
    ).toBe(true);
    expect(
      memorySchema.safeParse({
        family_id: familyId,
        title: "Urodziny",
        type: "event",
        visibility: "family",
        person_ids: [],
        file: null,
      }).success,
    ).toBe(true);
  });

  it("rejects duplicate person assignments", () => {
    expect(
      memorySchema.safeParse({
        family_id: familyId,
        title: "Duplikat",
        type: "story",
        visibility: "family",
        person_ids: [people[0], people[0]],
        file: null,
      }).success,
    ).toBe(false);
  });
});
