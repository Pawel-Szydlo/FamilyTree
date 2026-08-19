import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServiceClient: vi.fn(),
  sendBirthdayEmail: vi.fn(),
}));

vi.mock("../../lib/supabase/service", () => ({
  createServiceClient: mocks.createServiceClient,
}));
vi.mock("./email", () => ({ sendBirthdayEmail: mocks.sendBirthdayEmail }));

import { sendBirthdayNotifications } from "./dispatcher";

const today = { year: 2026, month: 5, day: 20 };

type Query = Promise<{ data: unknown; error: unknown }> & {
  select: () => Query;
  eq: () => Query;
  is: () => Query;
};

function query(data: unknown, error: unknown = null): Query {
  const result = Promise.resolve({ data, error }) as Query;
  result.select = vi.fn(() => result);
  result.eq = vi.fn(() => result);
  result.is = vi.fn(() => result);
  return result;
}

function makeClient(options?: {
  duplicate?: boolean;
  email?: string;
  preferences?: unknown[];
}) {
  const update = vi.fn((values: unknown) => {
    updates.push(values);
    return query(null);
  });
  const updates: unknown[] = [];
  const logs = {
    insert: vi.fn(() =>
      query(
        options?.duplicate ? null : [{ id: "log-1" }],
        options?.duplicate ? { code: "23505" } : null,
      ),
    ),
    update,
  };
  const people = [
    {
      id: "person-today",
      family_id: "family-1",
      first_name: "Anna",
      last_name: "Kowalska",
      preferred_name: null,
      birth_month: 5,
      birth_day: 20,
      archived_at: null,
    },
    {
      id: "person-week",
      family_id: "family-1",
      first_name: "Jan",
      last_name: "Kowalski",
      preferred_name: null,
      birth_month: 5,
      birth_day: 27,
      archived_at: null,
    },
  ];
  const from = vi.fn((table: string) => {
    if (table === "people") return query(people);
    if (table === "family_members")
      return query([{ family_id: "family-1", user_id: "user-1" }]);
    if (table === "notification_preferences")
      return query(options?.preferences ?? []);
    if (table === "families")
      return query([{ id: "family-1", name: "Kowalscy" }]);
    return logs;
  });
  return {
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({
          data: { user: { email: options?.email ?? "member@example.com" } },
          error: null,
        }),
      },
    },
    from,
    updates,
  };
}

describe("birthday notification dispatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendBirthdayEmail.mockResolvedValue("msg-1");
  });

  it("sends both seven-day and same-day reminders", async () => {
    const client = makeClient();
    mocks.createServiceClient.mockReturnValue(client);
    const result = await sendBirthdayNotifications(today);
    expect(result).toMatchObject({ considered: 2, sent: 2, failed: 0 });
    expect(mocks.sendBirthdayEmail).toHaveBeenCalledTimes(2);
  });

  it("respects a disabled global preference", async () => {
    const client = makeClient({
      preferences: [
        {
          family_id: "family-1",
          user_id: "user-1",
          person_id: null,
          enabled: false,
          notify_7_days_before: true,
          notify_on_day: true,
        },
      ],
    });
    mocks.createServiceClient.mockReturnValue(client);
    const result = await sendBirthdayNotifications(today);
    expect(result.skipped).toBe(2);
    expect(mocks.sendBirthdayEmail).not.toHaveBeenCalled();
  });

  it("skips a duplicate claim from the unique notification constraint", async () => {
    const client = makeClient({ duplicate: true });
    mocks.createServiceClient.mockReturnValue(client);
    const result = await sendBirthdayNotifications(today);
    expect(result).toMatchObject({ considered: 2, sent: 0, skipped: 2 });
    expect(mocks.sendBirthdayEmail).not.toHaveBeenCalled();
  });

  it("logs a bad recipient as a failed delivery", async () => {
    const client = makeClient({ email: "not-an-email" });
    mocks.sendBirthdayEmail.mockRejectedValue(
      new Error("Invalid recipient email address."),
    );
    mocks.createServiceClient.mockReturnValue(client);
    const result = await sendBirthdayNotifications(today);
    expect(result.failed).toBe(2);
    expect(client.updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ delivery_status: "failed" }),
      ]),
    );
  });
});
