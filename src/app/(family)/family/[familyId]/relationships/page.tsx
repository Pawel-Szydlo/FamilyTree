import { GitBranch } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RelationshipsWorkspace } from "@/features/relationships/components/relationship-forms";
import { getRelationshipData } from "@/features/relationships/queries";

export default async function RelationshipsPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;
  const data = await getRelationshipData(familyId);
  return (
    <div>
      <PageHeader
        eyebrow="Relacje"
        title="Relacje rodzinne"
        description="Związki oraz relacje rodzic–dziecko, bez modelowania małżeństwa jako zwykłej krawędzi."
        action={
          <GitBranch className="hidden size-10 rounded-2xl bg-accent p-2 text-primary sm:block" />
        }
      />
      <RelationshipsWorkspace familyId={familyId} {...data} />
    </div>
  );
}
