"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { Maximize2, Minus, Plus, Search, Target, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Person } from "@/features/people/queries";
import type { ParentLink, Partnership } from "@/features/relationships/queries";
import { layoutTreeGraph } from "../layout";
import {
  buildTreeGraph,
  type PersonNodeData,
  personNodeId,
  type TreeEdge,
  type TreeNode,
  type TreeViewMode,
} from "../model";
import { nodeTypes } from "./tree-nodes";

type Props = {
  people: Person[];
  partnerships: Partnership[];
  parentLinks: ParentLink[];
};

function CanvasContent({ people, partnerships, parentLinks }: Props) {
  const reactFlow = useReactFlow();
  const [activePersonId, setActivePersonId] = useState(people[0]?.id);
  const [mode, setMode] = useState<TreeViewMode>("all");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [graph, setGraph] = useState({
    nodes: [] as ReturnType<typeof buildTreeGraph>["nodes"],
    edges: [] as ReturnType<typeof buildTreeGraph>["edges"],
  });
  const model = useMemo(
    () => ({ people, partnerships, parentLinks }),
    [people, partnerships, parentLinks],
  );
  const built = useMemo(
    () =>
      buildTreeGraph(model, {
        activePersonId,
        viewMode: mode,
        collapsedNodeIds: collapsed,
        search,
      }),
    [model, activePersonId, mode, collapsed, search],
  );
  useEffect(() => {
    let cancelled = false;
    layoutTreeGraph(built.nodes, built.edges).then((next) => {
      if (!cancelled) setGraph(next);
    });
    return () => {
      cancelled = true;
    };
  }, [built]);
  const centerOn = useCallback(
    (personId: string) => {
      const node = graph.nodes.find(
        (item) => item.id === personNodeId(personId),
      );
      if (node) {
        setActivePersonId(personId);
        reactFlow.setCenter(node.position.x + 110, node.position.y + 66, {
          zoom: 1.05,
          duration: 500,
        });
      }
    },
    [graph.nodes, reactFlow],
  );
  const toggleCollapse = () => {
    if (!activePersonId) return;
    const id = personNodeId(activePersonId);
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const activeName =
    people.find((person) => person.id === activePersonId)?.preferred_name ||
    "osobie";
  if (!people.length)
    return (
      <div className="flex min-h-[560px] items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
        <div>
          <Target className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-primary">
            Drzewo jest jeszcze puste
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dodaj osoby i relacje, aby zobaczyć gałęzie rodziny.
          </p>
        </div>
      </div>
    );
  return (
    <div className="tree-canvas relative h-[min(72vh,720px)] min-h-[560px] overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <ReactFlow<TreeNode, TreeEdge>
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, duration: 500 }}
        onNodeClick={(_, node) => {
          if (node.type === "person")
            setActivePersonId((node.data as PersonNodeData).person.id);
        }}
        onNodeDoubleClick={(_, node) => {
          if (node.type === "person")
            centerOn((node.data as PersonNodeData).person.id);
        }}
        nodesDraggable
        nodesConnectable={false}
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{ animated: false }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} color="oklch(0.86 0.035 88)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) =>
            node.type === "partnership"
              ? "oklch(0.33 0.09 150)"
              : "oklch(0.9 0.06 88)"
          }
          maskColor="oklch(0.98 0.02 88 / 0.7)"
        />
        <Panel position="top-left" className="!m-3 !w-[calc(100%-1.5rem)]">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/90 p-2 shadow-sm backdrop-blur">
            <label className="relative min-w-48 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-card pl-9 pr-8 text-sm outline-none focus:border-primary"
                placeholder="Szukaj osoby..."
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Wyczyść wyszukiwanie"
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
            <Button
              size="sm"
              variant={mode === "branch" ? "default" : "secondary"}
              onClick={() => setMode("branch")}
            >
              Moja gałąź
            </Button>
            <Button
              size="sm"
              variant={mode === "all" ? "default" : "secondary"}
              onClick={() => setMode("all")}
            >
              Cała rodzina
            </Button>
          </div>
        </Panel>
        <Panel position="top-right" className="!m-3">
          <div className="flex gap-1 rounded-2xl border border-border bg-background/90 p-1 shadow-sm backdrop-blur">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => reactFlow.fitView({ duration: 500, padding: 0.2 })}
              aria-label="Dopasuj widok"
            >
              <Maximize2 />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => activePersonId && centerOn(activePersonId)}
              aria-label={`Wycentruj na ${activeName}`}
            >
              <Target />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={toggleCollapse}
              aria-label="Zwiń lub rozwiń gałąź"
            >
              {collapsed.has(personNodeId(activePersonId ?? "")) ? (
                <Plus />
              ) : (
                <Minus />
              )}
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function TreeCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
}
