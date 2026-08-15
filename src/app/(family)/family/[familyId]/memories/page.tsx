import { BookHeart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MemoryWorkspace } from "@/features/memories/components/memory-workspace";
import { getMemories, getMemoryPeople } from "@/features/memories/queries";

export default async function MemoriesPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;
  const [memories, people] = await Promise.all([
    getMemories(familyId),
    getMemoryPeople(familyId),
  ]);
  return (
    <div>
      <PageHeader
        eyebrow="Rodzinny album"
        title="Wspomnienia"
        description="Zdjęcia, historie i wydarzenia, do których warto wracać."
        action={
          <BookHeart className="hidden size-10 rounded-2xl bg-accent p-2 text-primary sm:block" />
        }
      />
      <MemoryWorkspace
        familyId={familyId}
        memories={memories}
        people={people}
      />
    </div>
  );
}
