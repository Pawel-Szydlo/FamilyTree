import { describe, expect, it } from "vitest";
import { layoutTreeGraph } from "./layout";
import { buildTreeGraph, type TreeModel } from "./model";

const model: TreeModel = {
  people: [
    {
      id: "a",
      family_id: "f",
      first_name: "Anna",
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
    },
  ],
  partnerships: [],
  parentLinks: [],
};

describe("tree layout", () => {
  it("returns empty graphs without invoking layout work", async () => {
    expect(await layoutTreeGraph([], [])).toEqual({ nodes: [], edges: [] });
  });

  it("assigns finite positions without changing graph identity", async () => {
    const graph = buildTreeGraph(model);
    const result = await layoutTreeGraph(graph.nodes, graph.edges);
    expect(result.nodes[0].id).toBe(graph.nodes[0].id);
    expect(Number.isFinite(result.nodes[0].position.x)).toBe(true);
    expect(Number.isFinite(result.nodes[0].position.y)).toBe(true);
  });
});
