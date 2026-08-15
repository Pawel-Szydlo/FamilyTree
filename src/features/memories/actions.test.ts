import { describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createMemory } from "./actions";

function form(values: Record<string, string | string[] | File>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const item of Array.isArray(value) ? value : [value])
      data.append(key, item);
  }
  return data;
}

describe("memory actions", () => {
  it("validates before accessing Supabase", async () => {
    const result = await createMemory(
      {},
      form({
        family_id: "not-a-uuid",
        title: "",
        type: "photo",
        visibility: "family",
        person_ids: [],
      }),
    );
    expect(result.error).toBe("Sprawdź formularz.");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("denies a family member without an editor role", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: { role: "viewer" } }),
              }),
            }),
          }),
        }),
      }),
    });
    const result = await createMemory(
      {},
      form({
        family_id: "11111111-1111-4111-8111-111111111111",
        title: "Historia",
        type: "story",
        visibility: "family",
        person_ids: [],
      }),
    );
    expect(result.error).toContain("uprawnień");
  });
});
