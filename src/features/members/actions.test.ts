import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { removeMember, updateMemberRole } from "./actions";

type Query = Promise<{ data?: unknown; count?: number; error?: unknown }> & {
  select: () => Query;
  eq: () => Query;
  maybeSingle: () => Promise<{ data?: unknown; error?: unknown }>;
};

function query(value: {
  data?: unknown;
  count?: number;
  error?: unknown;
}): Query {
  const result = Promise.resolve(value) as Query;
  result.select = vi.fn(() => result);
  result.eq = vi.fn(() => result);
  result.maybeSingle = vi.fn().mockResolvedValue(value);
  return result;
}

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function clientFor(role: string, targetRole: string, ownerCount: number) {
  const calls = [
    query({ data: { role } }),
    query({ data: { role: targetRole } }),
    query({ count: ownerCount }),
  ];
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "actor" } } }),
    },
    from: vi.fn(() => calls.shift() ?? query({ data: null })),
  };
}

describe("member actions", () => {
  beforeEach(() => createClient.mockReset());

  it("rejects a viewer trying to manage members", async () => {
    createClient.mockResolvedValue(clientFor("viewer", "member", 2));
    const result = await removeMember(
      {},
      form({ family_id: "family-1", user_id: "user-2" }),
    );
    expect(result.error).toContain("uprawnień");
  });

  it("protects the last owner from removal", async () => {
    createClient.mockResolvedValue(clientFor("owner", "owner", 1));
    const result = await removeMember(
      {},
      form({ family_id: "family-1", user_id: "owner-1" }),
    );
    expect(result.error).toContain("ostatniego ownera");
  });

  it("does not allow an admin to promote someone to owner", async () => {
    createClient.mockResolvedValue(clientFor("admin", "member", 2));
    const result = await updateMemberRole(
      {},
      form({ family_id: "family-1", user_id: "user-2", role: "owner" }),
    );
    expect(result.error).toContain("Tylko owner");
  });
});
