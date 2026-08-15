import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createParentLink, createPartnership } from "./actions";

function form(values: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const item of Array.isArray(value) ? value : [value])
      data.append(key, item);
  }
  return data;
}

describe("relationship actions", () => {
  it("rejects an invalid multi-partner form before authorization", async () => {
    const result = await createPartnership(
      {},
      form({
        family_id: "11111111-1111-4111-8111-111111111111",
        partner_ids: ["22222222-2222-4222-8222-222222222222"],
        partnership_type: "marriage",
        status: "active",
      }),
    );
    expect(result.error).toBe("Sprawdź formularz.");
  });

  it("rejects a direct self-parent action before authorization", async () => {
    const person = "22222222-2222-4222-8222-222222222222";
    const result = await createParentLink(
      {},
      form({
        family_id: "11111111-1111-4111-8111-111111111111",
        parent_source: "person",
        parent_person_id: person,
        child_person_id: person,
        relation_type: "biological",
        status: "confirmed",
      }),
    );
    expect(result.error).toBe("Sprawdź formularz.");
  });
});
