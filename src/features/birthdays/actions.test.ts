import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { setBirthdayPreference } from "./actions";

function formData() {
  const data = new FormData();
  data.set("family_id", "family-1");
  data.set("enabled", "false");
  return data;
}

describe("birthday preferences", () => {
  beforeEach(() => vi.clearAllMocks());

  it("disables the global preference for an authenticated family member", async () => {
    const membership = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: { role: "member" }, error: null }),
    };
    const update = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    const preferences = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnValue(update),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: { id: "pref-1" }, error: null }),
    };
    const supabase = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: vi.fn((table: string) =>
        table === "family_members"
          ? membership
          : table === "notification_preferences"
            ? preferences
            : update,
      ),
    };
    mocks.createClient.mockResolvedValue(supabase);

    const result = await setBirthdayPreference({}, formData());

    expect(result).toEqual({ success: "Preferencje zapisane." });
    expect(preferences.update).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/family/family-1/calendar",
    );
  });

  it("rejects a request without an authenticated user", async () => {
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });
    await expect(setBirthdayPreference({}, formData())).resolves.toEqual({
      error: "Sesja wygasła. Zaloguj się ponownie.",
    });
  });
});
