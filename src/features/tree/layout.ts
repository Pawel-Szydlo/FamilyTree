import type { Edge, Node } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";
import type { TreeEdge, TreeNode, TreeNodeData } from "./model";
import { toElkGraph } from "./model";

const elk = new ELK();

export async function layoutTreeGraph(nodes: TreeNode[], edges: TreeEdge[]) {
  if (!nodes.length) return { nodes, edges };
  const result = await elk.layout(toElkGraph(nodes, edges));
  const positions = new Map(
    (result.children ?? []).map((child) => [
      child.id,
      { x: child.x ?? 0, y: child.y ?? 0 },
    ]),
  );
  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: positions.get(node.id) ?? node.position,
    })),
    edges,
  };
}

export function layoutNodesForTest(
  nodes: TreeNode[],
  positions: Record<string, { x: number; y: number }>,
): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    position: positions[node.id] ?? node.position,
  }));
}

export type RenderNode = Node<TreeNodeData, "person" | "partnership">;
export type RenderEdge = Edge;
