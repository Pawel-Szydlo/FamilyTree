"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Heart, UserRound } from "lucide-react";
import type { PartnershipNodeData, PersonNodeData, TreeNode } from "../model";

const nameOf = (data: PersonNodeData) =>
  data.person.preferred_name ||
  [data.person.first_name, data.person.last_name].filter(Boolean).join(" ") ||
  "Osoba bez nazwy";
const relationNames: Record<string, string> = {
  biological: "Biologiczna",
  adoptive: "Adopcyjna",
  foster: "Opiekuńcza",
  step: "Przybrana",
  guardian: "Opiekun prawny",
  unknown: "Nieznana",
};

export function PersonNode({ data }: NodeProps<TreeNode>) {
  const personData = data as PersonNodeData;
  const year =
    personData.person.birth_year && personData.person.birth_year_visible
      ? ` · ${personData.person.birth_year}`
      : "";
  return (
    <div
      className={`tree-person-node ${personData.isActive ? "tree-person-node-active" : ""} ${personData.isHighlighted ? "tree-person-node-highlighted" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2 !border-2 !border-primary !bg-background"
      />
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent text-primary">
          {personData.person.avatar_path ? (
            <div
              role="img"
              aria-label="Zdjęcie osoby"
              className="size-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${personData.person.avatar_path})`,
              }}
            />
          ) : (
            <UserRound className="size-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-primary">
            {nameOf(personData)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {personData.person.is_living ? "Żyjąca" : "Zmarła"}
            {year}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-2">
        <span className="truncate text-xs font-medium text-primary/75">
          {personData.relationLabel}
        </span>
        {personData.person.is_placeholder && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
            Placeholder
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !border-2 !border-primary !bg-background"
      />
    </div>
  );
}

export function PartnershipNode({ data }: NodeProps<TreeNode>) {
  const partnershipData = data as PartnershipNodeData;
  const label =
    partnershipData.partnership.members.length > 2
      ? `${partnershipData.partnership.members.length} partnerów`
      : partnershipData.partnership.partnership_type === "marriage"
        ? "Małżeństwo"
        : "Związek";
  return (
    <div className="tree-partnership-node" title={label}>
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2 !border-2 !border-primary !bg-background"
      />
      <Heart className="size-4 fill-current" />
      <span>{label}</span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !border-2 !border-primary !bg-background"
      />
    </div>
  );
}

export const nodeTypes = { person: PersonNode, partnership: PartnershipNode };
export { relationNames };
