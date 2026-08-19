import { describe, expect, it, vi } from "vitest";

const createClient = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { getPeople } from "./queries";

describe("visible people query", () => {
  it("accepts the database-masked year for a living person", async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      // biome-ignore lint/suspicious/noThenProperty: Supabase builders are thenable.
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({
          data: [
            {
              id: "person-1",
              family_id: "family-1",
              first_name: "Jan",
              last_name: "Kowalski",
              preferred_name: null,
              biography: null,
              avatar_path: null,
              birth_day: 1,
              birth_month: 2,
              birth_year: null,
              birth_year_visible: false,
              is_living: true,
              is_placeholder: false,
              privacy_level: "family",
              archived_at: null,
              updated_at: "now",
            },
          ],
          error: null,
        }).then(resolve),
    };
    createClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    const people = await getPeople("family-1");
    expect(people[0].birth_year).toBeNull();
    expect(builder.select).toHaveBeenCalledWith(
      expect.not.stringContaining("storage"),
    );
  });
});
