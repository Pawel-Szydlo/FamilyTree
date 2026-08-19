import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getExportData: vi.fn(),
  createClient: vi.fn(),
}));
vi.mock("@/features/export/data", () => ({
  getExportData: mocks.getExportData,
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { GET } from "./route";

describe("family export endpoint", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not export data for a non-member", async () => {
    mocks.getExportData.mockResolvedValue(null);
    const response = await GET(
      new Request("http://localhost/api/family/foreign/export?format=json"),
      { params: Promise.resolve({ familyId: "foreign" }) },
    );
    expect(response.status).toBe(403);
  });

  it("exports JSON without Storage paths", async () => {
    mocks.getExportData.mockResolvedValue({
      exported_at: "now",
      family_id: "family-1",
      people: [],
      partnerships: [],
      partnership_members: [],
      parent_links: [],
      memories: [],
      memory_people: [],
      photos: [{ id: "photo-1", storage_path: "family-1/private.jpg" }],
      photo_people: [],
    });
    const response = await GET(
      new Request("http://localhost/api/family/family-1/export?format=json"),
      { params: Promise.resolve({ familyId: "family-1" }) },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).not.toContain("private.jpg");
  });
});
