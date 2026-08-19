import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { getFamilies } from "./queries";

describe("families query", () => {
  beforeEach(() => createClient.mockReset());

  it("returns every family available to the account for switching", async () => {
    const families = [
      { id: "family-a", name: "A", slug: "a", created_at: "2026-01-01" },
      { id: "family-b", name: "B", slug: "b", created_at: "2026-01-02" },
    ];
    const result = Promise.resolve({ data: families, error: null });
    const builder = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(result),
    };
    createClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    await expect(getFamilies()).resolves.toEqual(families);
  });
});
