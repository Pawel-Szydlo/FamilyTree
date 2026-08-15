import { describe, expect, it } from "vitest";
import {
  parentLinkSchema,
  partnershipSchema,
  wouldCreateParentCycle,
} from "./schema";

const familyId = "11111111-1111-4111-8111-111111111111";
const people = [
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
  "55555555-5555-4555-8555-555555555555",
];

describe("relationship schemas", () => {
  it("supports multiple partners and divorce", () => {
    expect(
      partnershipSchema.safeParse({
        family_id: familyId,
        partner_ids: people.slice(0, 3),
        partnership_type: "relationship",
        status: "divorced",
        start_date: "2000-01-01",
        end_date: "2010-01-01",
        notes: null,
      }).success,
    ).toBe(true);
  });

  it("rejects duplicate partners and reversed dates", () => {
    expect(
      partnershipSchema.safeParse({
        family_id: familyId,
        partner_ids: [people[0], people[0]],
        partnership_type: "marriage",
        status: "active",
        start_date: "2020-01-01",
        end_date: "2010-01-01",
      }).success,
    ).toBe(false);
  });

  it("supports adoption, foster care and an unknown status", () => {
    for (const relation_type of ["adoptive", "foster", "unknown"] as const) {
      expect(
        parentLinkSchema.safeParse({
          family_id: familyId,
          parent_source: "person",
          parent_person_id: people[0],
          child_person_id: people[1],
          relation_type,
          status: "unknown",
          notes: null,
        }).success,
      ).toBe(true);
    }
  });

  it("allows a placeholder parent because placeholder is a property of people", () => {
    expect(
      parentLinkSchema.safeParse({
        family_id: familyId,
        parent_source: "person",
        parent_person_id: people[2],
        child_person_id: people[3],
        relation_type: "guardian",
        status: "probable",
        notes: null,
      }).success,
    ).toBe(true);
  });

  it("detects direct and indirect parent cycles", () => {
    expect(
      wouldCreateParentCycle([], { parentId: people[0], childId: people[0] }),
    ).toBe(true);
    const existing = [
      { parentId: people[0], childId: people[1] },
      { parentId: people[1], childId: people[2] },
    ];
    expect(
      wouldCreateParentCycle(existing, {
        parentId: people[2],
        childId: people[0],
      }),
    ).toBe(true);
    expect(
      wouldCreateParentCycle(existing, {
        parentId: people[2],
        childId: people[3],
      }),
    ).toBe(false);
  });
});
