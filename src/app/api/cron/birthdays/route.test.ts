import { beforeEach, describe, expect, it, vi } from "vitest";

const run = vi.hoisted(() => vi.fn());
vi.mock("@/features/notifications/dispatcher", () => ({
  sendBirthdayNotifications: run,
}));

import { GET } from "./route";

describe("birthday cron endpoint", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "cron-secret");
    run.mockResolvedValue({ sent: 1, failed: 0 });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await GET(
      new Request("http://localhost/api/cron/birthdays"),
    );
    expect(response.status).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });

  it("runs with the bearer cron secret", async () => {
    const response = await GET(
      new Request("http://localhost/api/cron/birthdays", {
        headers: { authorization: "Bearer cron-secret" },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, sent: 1 });
  });

  it("reports missing cron configuration", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const response = await GET(
      new Request("http://localhost/api/cron/birthdays"),
    );
    expect(response.status).toBe(503);
  });
});
