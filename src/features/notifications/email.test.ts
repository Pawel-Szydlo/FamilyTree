import { beforeEach, describe, expect, it, vi } from "vitest";

const resendSend = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: resendSend };
  },
}));

import { renderBirthdayEmail, sendBirthdayEmail } from "./email";

const input = {
  recipient: "member@example.com",
  personName: "Anna Kowalska",
  familyName: "Kowalscy",
  month: 5,
  day: 20,
  year: 2026,
};

describe("birthday emails", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "resend-test-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "FamilyTree <noreply@example.com>");
    resendSend.mockReset();
    resendSend.mockResolvedValue({ data: { id: "msg-1" }, error: null });
  });

  it.each([
    "birthday_today",
    "birthday_7_days",
  ] as const)("renders and sends the %s reminder", async (type) => {
    const message = renderBirthdayEmail({ ...input, type });
    await expect(sendBirthdayEmail({ ...input, type })).resolves.toBe("msg-1");
    expect(message.text).toContain("Anna Kowalska");
    expect(resendSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "member@example.com" }),
    );
  });

  it("rejects an invalid recipient without calling Resend", async () => {
    await expect(
      sendBirthdayEmail({
        ...input,
        recipient: "invalid-address",
        type: "birthday_today",
      }),
    ).rejects.toThrow("Invalid recipient email address.");
    expect(resendSend).not.toHaveBeenCalled();
  });

  it("surfaces a Resend error", async () => {
    resendSend.mockResolvedValue({
      data: null,
      error: { message: "rejected" },
    });
    await expect(
      sendBirthdayEmail({ ...input, type: "birthday_today" }),
    ).rejects.toThrow("Resend rejected the message.");
  });

  it("escapes untrusted names in HTML templates", () => {
    const message = renderBirthdayEmail({
      ...input,
      personName: "<script>alert(1)</script>",
      type: "birthday_today",
    });
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
  });
});
