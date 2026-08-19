import { describe, expect, it } from "vitest";
import {
  createInvitationToken,
  hashInvitationToken,
  invitationExpiry,
} from "./token";

describe("invitation tokens", () => {
  it("stores only a one-way hash and produces unique tokens", () => {
    const first = createInvitationToken();
    const second = createInvitationToken();
    expect(first).not.toBe(second);
    expect(hashInvitationToken(first)).not.toContain(first);
    expect(hashInvitationToken(first)).toHaveLength(64);
    expect(hashInvitationToken(first)).toBe(hashInvitationToken(first));
  });

  it("expires invitations after the configured period", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    expect(invitationExpiry(7, now).toISOString()).toBe(
      "2026-01-08T12:00:00.000Z",
    );
  });
});
