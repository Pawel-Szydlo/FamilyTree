import { describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { getMemories } from "./queries";

const familyId = "11111111-1111-4111-8111-111111111111";

function query(data: unknown[]) {
  const chain: Record<string, unknown> & {
    then?: (resolve: (value: unknown) => unknown) => Promise<unknown>;
  } = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn((column: string, value: string) => {
    if (column === "family_id") {
      chain.data = data.filter(
        (row) => (row as { family_id?: string }).family_id === value,
      );
    }
    return chain;
  });
  chain.is = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  // biome-ignore lint/suspicious/noThenProperty: this test double models Supabase's thenable query builder.
  chain.then = (resolve) =>
    Promise.resolve({ data: chain.data ?? data, error: null }).then(resolve);
  return chain;
}

describe("memory queries", () => {
  it("scopes photo rows and signed URLs to the requested family", async () => {
    const scopedPhoto = {
      id: "photo-a",
      family_id: familyId,
      storage_path: `${familyId}/photo.jpg`,
      caption: null,
      taken_at: null,
    };
    const foreignPhoto = {
      id: "photo-b",
      family_id: "22222222-2222-4222-8222-222222222222",
      storage_path: "22222222-2222-4222-8222-222222222222/foreign.jpg",
      caption: null,
      taken_at: null,
    };
    const from = vi.fn((table: string) =>
      query(
        table === "photos"
          ? [scopedPhoto, foreignPhoto]
          : table === "memories"
            ? [
                {
                  id: "memory-a",
                  family_id: familyId,
                  title: "A",
                  body: null,
                  type: "photo",
                  memory_date: null,
                  visibility: "family",
                  photo_id: "photo-a",
                  created_at: "now",
                  updated_at: "now",
                },
              ]
            : [],
      ),
    );
    const createSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: "signed-family-a" },
      error: null,
    });
    createClient.mockResolvedValue({
      from,
      storage: { from: vi.fn(() => ({ createSignedUrl })) },
    });

    const memories = await getMemories(familyId);

    expect(from.mock.calls.filter(([table]) => table === "photos").length).toBe(
      1,
    );
    expect(createSignedUrl).toHaveBeenCalledWith(
      scopedPhoto.storage_path,
      3600,
    );
    expect(createSignedUrl).not.toHaveBeenCalledWith(
      foreignPhoto.storage_path,
      3600,
    );
    expect(memories[0].photo?.signed_url).toBe("signed-family-a");
  });
});
