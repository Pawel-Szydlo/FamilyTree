import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/features/families/queries", () => ({ getFamilyById: vi.fn() }));
vi.mock("./mailer", () => ({ sendInvitationEmail: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { acceptInvitation } from "./actions";
import { hashInvitationToken } from "./token";

function form(token: string) {
  const data = new FormData();
  data.set("token", token);
  return data;
}

describe("invitation acceptance", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes only the hash to the one-time database RPC", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: "family-1", error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { message: "Invitation is invalid or expired" },
      });
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      rpc,
    });
    mocks.redirect.mockImplementation(() => {
      throw new Error("REDIRECT");
    });
    const token = "one-time-secret";

    await expect(acceptInvitation({}, form(token))).rejects.toThrow("REDIRECT");
    expect(rpc).toHaveBeenCalledWith("accept_invitation", {
      target_token_hash: hashInvitationToken(token),
    });
    await expect(acceptInvitation({}, form(token))).resolves.toEqual({
      error: "Zaproszenie jest nieprawidłowe lub wygasło.",
    });
    expect(rpc).toHaveBeenCalledTimes(2);
  });
});
