import { describe, expect, it } from "vitest";
import { type ExportData, toExportJson, toPeopleCsv } from "./format";

const data: ExportData = {
  exported_at: "2026-01-01T00:00:00.000Z",
  family_id: "family-1",
  people: [
    {
      id: "person-1",
      family_id: "family-1",
      first_name: "Jan, test",
      last_name: "Kowalski",
      preferred_name: null,
      biography: "tekst",
      birth_day: 1,
      birth_month: 2,
      birth_year: null,
      birth_year_visible: false,
      is_living: true,
      is_placeholder: false,
      privacy_level: "family",
    },
  ],
  partnerships: [],
  partnership_members: [],
  parent_links: [],
  memories: [],
  memory_people: [],
  photos: [{ id: "photo-1", storage_path: "family-1/secret.jpg" }],
  photo_people: [],
};

describe("privacy export format", () => {
  it("escapes CSV and does not expose storage paths in JSON", () => {
    expect(toPeopleCsv(data)).toContain('"Jan, test"');
    expect(toExportJson(data)).not.toContain("secret.jpg");
  });

  it("preserves explicit null for a hidden birth year", () => {
    expect(JSON.parse(toExportJson(data)).people[0].birth_year).toBeNull();
  });
});
