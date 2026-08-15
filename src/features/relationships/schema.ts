import { z } from "zod";

const uuid = z.string().uuid();
const nullableText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(max).nullable().optional(),
  );
const nullableDate = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().date().nullable().optional(),
);

const baseDateFields = {
  start_date: nullableDate,
  end_date: nullableDate,
  notes: nullableText(5000),
};

export const partnershipSchema = z
  .object({
    family_id: uuid,
    partnership_id: uuid.optional(),
    partner_ids: z.array(uuid).min(2, "Wybierz co najmniej dwóch partnerów."),
    partnership_type: z.enum(["marriage", "partnership", "relationship"]),
    status: z.enum(["active", "ended", "divorced", "widowed", "unknown"]),
    ...baseDateFields,
  })
  .superRefine((value, ctx) => {
    if (new Set(value.partner_ids).size !== value.partner_ids.length) {
      ctx.addIssue({
        code: "custom",
        path: ["partner_ids"],
        message: "Ta sama osoba nie może wystąpić dwa razy.",
      });
    }
    if (
      value.start_date &&
      value.end_date &&
      value.end_date < value.start_date
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Data zakończenia nie może być wcześniejsza od rozpoczęcia.",
      });
    }
  });

export const parentLinkSchema = z
  .object({
    family_id: uuid,
    parent_link_id: uuid.optional(),
    parent_source: z.enum(["person", "partnership"]),
    parent_person_id: uuid.nullable().optional(),
    parent_partnership_id: uuid.nullable().optional(),
    child_person_id: uuid,
    relation_type: z.enum([
      "biological",
      "adoptive",
      "foster",
      "step",
      "guardian",
      "unknown",
    ]),
    status: z.enum(["confirmed", "probable", "unknown"]),
    notes: nullableText(5000),
  })
  .superRefine((value, ctx) => {
    if (value.parent_source === "person" && !value.parent_person_id)
      ctx.addIssue({
        code: "custom",
        path: ["parent_person_id"],
        message: "Wybierz rodzica.",
      });
    if (value.parent_source === "partnership" && !value.parent_partnership_id)
      ctx.addIssue({
        code: "custom",
        path: ["parent_partnership_id"],
        message: "Wybierz związek.",
      });
    if (
      value.parent_source === "person" &&
      value.parent_person_id === value.child_person_id
    )
      ctx.addIssue({
        code: "custom",
        path: ["parent_person_id"],
        message: "Osoba nie może być własnym rodzicem.",
      });
  });

export type PartnershipInput = z.infer<typeof partnershipSchema>;
export type ParentLinkInput = z.infer<typeof parentLinkSchema>;

export function parsePartnershipForm(formData: FormData) {
  return partnershipSchema.safeParse({
    family_id: formData.get("family_id"),
    partnership_id: formData.get("partnership_id") || undefined,
    partner_ids: formData.getAll("partner_ids"),
    partnership_type: formData.get("partnership_type"),
    status: formData.get("status"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    notes: formData.get("notes"),
  });
}

export function parseParentLinkForm(formData: FormData) {
  return parentLinkSchema.safeParse({
    family_id: formData.get("family_id"),
    parent_link_id: formData.get("parent_link_id") || undefined,
    parent_source: formData.get("parent_source"),
    parent_person_id: formData.get("parent_person_id") || null,
    parent_partnership_id: formData.get("parent_partnership_id") || null,
    child_person_id: formData.get("child_person_id"),
    relation_type: formData.get("relation_type"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
}

export type ParentEdge = { parentId: string; childId: string };

export function wouldCreateParentCycle(
  edges: ParentEdge[],
  candidate: ParentEdge,
) {
  if (candidate.parentId === candidate.childId) return true;
  const graph = new Map<string, string[]>();
  for (const edge of edges)
    graph.set(edge.parentId, [
      ...(graph.get(edge.parentId) ?? []),
      edge.childId,
    ]);
  graph.set(candidate.parentId, [
    ...(graph.get(candidate.parentId) ?? []),
    candidate.childId,
  ]);
  const pending = [candidate.childId];
  const visited = new Set<string>();
  while (pending.length) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    if (current === candidate.parentId) return true;
    visited.add(current);
    pending.push(...(graph.get(current) ?? []));
  }
  return false;
}
