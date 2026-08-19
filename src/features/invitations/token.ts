import { createHash, randomBytes } from "node:crypto";

export function createInvitationToken() {
  return randomBytes(32).toString("base64url");
}

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function invitationExpiry(days = 7, now = new Date()) {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}
