import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createPerson, updatePerson } from "./actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("person actions", () => {
  beforeEach(() => createClient.mockReset());

  it("returns validation errors before touching the database", async () => {
    const result = await createPerson(
      {},
      form({ family_id: "not-a-uuid", first_name: "" }),
    );
    expect(result.error).toBe("Sprawdź formularz.");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects a member without an editor role", async () => {
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
    const result = await createPerson(
      {},
      form({
        family_id: "11111111-1111-4111-8111-111111111111",
        first_name: "Jan",
      }),
    );
    expect(result.error).toContain("uprawnień");
  });

  it("requires a version token when editing", async () => {
    const result = await updatePerson(
      {},
      form({
        family_id: "11111111-1111-4111-8111-111111111111",
        person_id: "22222222-2222-4222-8222-222222222222",
        first_name: "Jan",
      }),
    );
    expect(result.error).toContain("wersji");
  });
});
