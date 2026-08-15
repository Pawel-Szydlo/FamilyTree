import { describe, expect, it } from "vitest";
import type { Person } from "@/features/people/queries";
import {
  buildTreeGraph,
  partnershipNodeId,
  personNodeId,
  type TreeModel,
  toElkGraph,
} from "./model";

const person = (id: string, first_name = id) =>
  ({
    id,
    family_id: "family",
    first_name,
    last_name: "",
    preferred_name: null,
    biography: null,
    avatar_path: null,
    birth_day: null,
    birth_month: null,
    birth_year: null,
    birth_year_visible: false,
    is_living: true,
    is_placeholder: false,
    privacy_level: "family",
    archived_at: null,
    updated_at: "2026-01-01T00:00:00Z",
  }) as Person;
const model: TreeModel = {
  people: [
    person("a", "Anna"),
    person("b", "Bartek"),
    person("c", "Celina"),
    person("d", "Dawid"),
  ],
  partnerships: [
    {
      id: "p",
      family_id: "family",
      partnership_type: "marriage",
      status: "active",
      start_date: null,
      end_date: null,
      notes: null,
      updated_at: "2026-01-01T00:00:00Z",
      members: [
        { person_id: "a", role: "spouse", position: 0 },
        { person_id: "b", role: "spouse", position: 1 },
      ],
    },
  ],
  parentLinks: [
    {
      id: "l1",
      family_id: "family",
      parent_person_id: null,
      parent_partnership_id: "p",
      child_person_id: "c",
      relation_type: "biological",
      status: "confirmed",
      notes: null,
    },
    {
      id: "l2",
      family_id: "family",
      parent_person_id: "c",
      parent_partnership_id: null,
      child_person_id: "d",
      relation_type: "adoptive",
      status: "probable",
      notes: null,
    },
  ],
};

describe("tree model builder", () => {
  it("keeps partnerships as nodes and connects shared children through them", () => {
    const graph = buildTreeGraph(model, { activePersonId: "a" });
    expect(
      graph.nodes.some(
        (node) =>
          node.id === partnershipNodeId("p") && node.type === "partnership",
      ),
    ).toBe(true);
    expect(
      graph.edges.some(
        (edge) =>
          edge.source === partnershipNodeId("p") &&
          edge.target === personNodeId("c"),
      ),
    ).toBe(true);
    expect(
      graph.nodes.find((node) => node.id === personNodeId("b"))?.data,
    ).toMatchObject({ relationLabel: "Partner" });
    expect(
      graph.nodes.find((node) => node.id === personNodeId("c"))?.data,
    ).toMatchObject({ relationLabel: "Dziecko · biologiczna" });
  });

  it("supports branch filtering and collapsed branches", () => {
    const branch = buildTreeGraph(model, {
      activePersonId: "a",
      viewMode: "branch",
    });
    expect(branch.nodes.map((node) => node.id)).toContain(personNodeId("d"));
    const collapsed = buildTreeGraph(model, {
      activePersonId: "a",
      collapsedNodeIds: new Set([personNodeId("a")]),
    });
    expect(collapsed.nodes.map((node) => node.id)).not.toContain(
      partnershipNodeId("p"),
    );
  });

  it("marks search matches and creates an ELK graph with dimensions", () => {
    const graph = buildTreeGraph(model, { search: "cel" });
    expect(
      graph.nodes.find((node) => node.id === personNodeId("c"))?.data,
    ).toMatchObject({ isHighlighted: true });
    const elk = toElkGraph(graph.nodes, graph.edges);
    expect(
      elk.children.find((child) => child.id === personNodeId("a")),
    ).toMatchObject({ width: 220, height: 132 });
  });
});
