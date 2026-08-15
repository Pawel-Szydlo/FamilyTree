import type { Edge, Node } from "@xyflow/react";
import type { Person } from "@/features/people/queries";
import type { ParentLink, Partnership } from "@/features/relationships/queries";

export type TreeViewMode = "all" | "branch";
export type PersonNodeData = {
  kind: "person";
  person: Person;
  relationLabel: string;
  isHighlighted?: boolean;
  isActive?: boolean;
};
export type PartnershipNodeData = {
  kind: "partnership";
  partnership: Partnership;
  isHighlighted?: boolean;
};
export type TreeNodeData = PersonNodeData | PartnershipNodeData;
export type TreeNode = Node<TreeNodeData, "person" | "partnership">;
export type TreeEdgeData = {
  relationType?: ParentLink["relation_type"];
  kind: "partnership" | "parent";
};
export type TreeEdge = Edge<TreeEdgeData>;

export type TreeModel = {
  people: Person[];
  partnerships: Partnership[];
  parentLinks: ParentLink[];
};

export type TreeBuildOptions = {
  activePersonId?: string;
  viewMode?: TreeViewMode;
  collapsedNodeIds?: Set<string>;
  search?: string;
};

export const personNodeId = (id: string) => `person:${id}`;
export const partnershipNodeId = (id: string) => `partnership:${id}`;

const relationLabels: Record<ParentLink["relation_type"], string> = {
  biological: "biologiczna",
  adoptive: "adopcyjna",
  foster: "opiekuńcza",
  step: "przybrana",
  guardian: "opiekun prawny",
  unknown: "nieznana",
};

function relationForPerson(
  personId: string,
  model: TreeModel,
  activePersonId?: string,
) {
  if (!activePersonId || personId === activePersonId)
    return personId === activePersonId ? "Aktywna osoba" : "Osoba";
  const labels: string[] = [];
  for (const link of model.parentLinks) {
    if (
      link.parent_person_id === personId &&
      link.child_person_id === activePersonId
    )
      labels.push(`Rodzic · ${relationLabels[link.relation_type]}`);
    if (
      link.child_person_id === personId &&
      link.parent_person_id === activePersonId
    )
      labels.push(`Dziecko · ${relationLabels[link.relation_type]}`);
    if (
      link.parent_partnership_id &&
      link.child_person_id === activePersonId &&
      model.partnerships
        .find((partnership) => partnership.id === link.parent_partnership_id)
        ?.members.some((member) => member.person_id === personId)
    )
      labels.push(`Rodzic · ${relationLabels[link.relation_type]}`);
    if (
      link.parent_partnership_id &&
      link.child_person_id === personId &&
      model.partnerships
        .find((partnership) => partnership.id === link.parent_partnership_id)
        ?.members.some((member) => member.person_id === activePersonId)
    )
      labels.push(`Dziecko · ${relationLabels[link.relation_type]}`);
  }
  const sharedPartnership = model.partnerships.some((partnership) => {
    const ids = partnership.members.map((member) => member.person_id);
    return ids.includes(personId) && ids.includes(activePersonId);
  });
  if (sharedPartnership) labels.push("Partner");
  if (!labels.length) {
    const isParent = model.parentLinks.some(
      (link) =>
        link.child_person_id === activePersonId &&
        (link.parent_person_id === personId ||
          (link.parent_partnership_id &&
            model.partnerships
              .find(
                (partnership) => partnership.id === link.parent_partnership_id,
              )
              ?.members.some((member) => member.person_id === personId))),
    );
    const isChild = model.parentLinks.some(
      (link) =>
        link.child_person_id === personId &&
        (link.parent_person_id === activePersonId ||
          (link.parent_partnership_id &&
            model.partnerships
              .find(
                (partnership) => partnership.id === link.parent_partnership_id,
              )
              ?.members.some((member) => member.person_id === activePersonId))),
    );
    if (isParent) labels.push("Rodzina w górę");
    if (isChild) labels.push("Rodzina w dół");
  }
  return labels[0] ?? "Rodzina";
}

function neighbors(nodes: TreeNode[], edges: TreeEdge[], start: string) {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    adjacency.set(edge.source, [
      ...(adjacency.get(edge.source) ?? []),
      edge.target,
    ]);
    adjacency.set(edge.target, [
      ...(adjacency.get(edge.target) ?? []),
      edge.source,
    ]);
  }
  const visited = new Set<string>([start]);
  const pending = [start];
  while (pending.length) {
    const current = pending.pop();
    if (!current) continue;
    for (const next of adjacency.get(current) ?? [])
      if (!visited.has(next)) {
        visited.add(next);
        pending.push(next);
      }
  }
  return nodes.filter((node) => visited.has(node.id));
}

function collapse(
  nodes: TreeNode[],
  edges: TreeEdge[],
  collapsedNodeIds: Set<string>,
) {
  const hidden = new Set<string>();
  const adjacency = new Map<string, string[]>();
  for (const edge of edges)
    adjacency.set(edge.source, [
      ...(adjacency.get(edge.source) ?? []),
      edge.target,
    ]);
  const pending = [...collapsedNodeIds];
  while (pending.length) {
    const current = pending.pop();
    if (!current) continue;
    for (const next of adjacency.get(current) ?? [])
      if (!collapsedNodeIds.has(next) && !hidden.has(next)) {
        hidden.add(next);
        pending.push(next);
      }
  }
  return nodes.filter((node) => !hidden.has(node.id));
}

export function buildTreeGraph(
  model: TreeModel,
  options: TreeBuildOptions = {},
) {
  const activePersonId = options.activePersonId;
  const search = options.search?.trim().toLocaleLowerCase();
  let nodes: TreeNode[] = model.people.map((person) => ({
    id: personNodeId(person.id),
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      kind: "person",
      person,
      relationLabel: relationForPerson(person.id, model, activePersonId),
      isActive: person.id === activePersonId,
      isHighlighted: Boolean(
        search &&
          `${person.first_name} ${person.last_name} ${person.preferred_name ?? ""}`
            .toLocaleLowerCase()
            .includes(search),
      ),
    },
  }));
  nodes = nodes.concat(
    model.partnerships.map((partnership) => ({
      id: partnershipNodeId(partnership.id),
      type: "partnership",
      position: { x: 0, y: 0 },
      data: { kind: "partnership", partnership, isHighlighted: false },
    })),
  );
  const edges: TreeEdge[] = [];
  for (const partnership of model.partnerships)
    for (const member of partnership.members)
      edges.push({
        id: `member:${partnership.id}:${member.person_id}`,
        source: personNodeId(member.person_id),
        target: partnershipNodeId(partnership.id),
        type: "smoothstep",
        data: { kind: "partnership" },
        style: { stroke: "var(--color-primary)", strokeWidth: 1.5 },
        selectable: false,
      });
  for (const link of model.parentLinks)
    edges.push({
      id: `parent:${link.id}`,
      source: link.parent_person_id
        ? personNodeId(link.parent_person_id)
        : partnershipNodeId(link.parent_partnership_id ?? "missing"),
      target: personNodeId(link.child_person_id),
      type: "smoothstep",
      label: relationLabels[link.relation_type],
      data: { kind: "parent", relationType: link.relation_type },
      className: `tree-edge-${link.relation_type}`,
      animated: link.status === "probable",
    });
  let visibleNodes = nodes;
  if (options.viewMode === "branch" && activePersonId)
    visibleNodes = neighbors(nodes, edges, personNodeId(activePersonId));
  if (options.collapsedNodeIds?.size)
    visibleNodes = collapse(visibleNodes, edges, options.collapsedNodeIds);
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  return {
    nodes: visibleNodes,
    edges: edges.filter(
      (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target),
    ),
  };
}

export function toElkGraph(nodes: TreeNode[], edges: TreeEdge[]) {
  return {
    id: "tree",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": "48",
      "elk.layered.spacing.nodeNodeBetweenLayers": "72",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.type === "partnership" ? 72 : 220,
      height: node.type === "partnership" ? 44 : 132,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };
}
