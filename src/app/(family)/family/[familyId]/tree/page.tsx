import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getFamilyById } from "@/features/families/queries";
import { getRelationshipData } from "@/features/relationships/queries";
import { TreeCanvas } from "@/features/tree/components/tree-canvas";

export default async function TreePage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;
  const [family, data] = await Promise.all([
    getFamilyById(familyId),
    getRelationshipData(familyId),
  ]);
  return (
    <div>
      <PageHeader
        eyebrow="Drzewo rodziny"
        title={family?.name ?? "Rodzina"}
        description="Zobacz, jak łączą się historie Twojej rodziny."
        action={
          <Link href={`/family/${familyId}/people`}>
            <Button>
              <Plus />
              Dodaj osobę
            </Button>
          </Link>
        }
      />
      <div className="px-5 py-6 sm:px-8">
        <TreeCanvas {...data} />
      </div>
    </div>
  );
}
