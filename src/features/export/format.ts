export type ExportPerson = {
  id: string;
  family_id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  biography: string | null;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  birth_year_visible: boolean;
  is_living: boolean;
  is_placeholder: boolean;
  privacy_level: string;
};

export type ExportData = {
  exported_at: string;
  family_id: string;
  people: ExportPerson[];
  partnerships: Record<string, unknown>[];
  partnership_members: Record<string, unknown>[];
  parent_links: Record<string, unknown>[];
  memories: Record<string, unknown>[];
  memory_people: Record<string, unknown>[];
  photos: Array<Record<string, unknown> & { storage_path?: string }>;
  photo_people: Record<string, unknown>[];
};

function csv(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function toPeopleCsv(data: ExportData) {
  const headers = [
    "id",
    "family_id",
    "first_name",
    "last_name",
    "preferred_name",
    "biography",
    "birth_day",
    "birth_month",
    "birth_year",
    "birth_year_visible",
    "is_living",
    "is_placeholder",
    "privacy_level",
  ];
  return [
    headers.join(","),
    ...data.people.map((person) =>
      headers
        .map((header) => csv(person[header as keyof ExportPerson]))
        .join(","),
    ),
  ].join("\n");
}

export function toExportJson(data: ExportData) {
  return JSON.stringify(
    {
      ...data,
      photos: data.photos.map(
        ({ storage_path: _storagePath, ...photo }) => photo,
      ),
    },
    null,
    2,
  );
}
