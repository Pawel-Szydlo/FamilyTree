import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PeopleWorkspace } from "@/features/people/components/people-workspace";
import { getPeople } from "@/features/people/queries";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;
  const people = await getPeople(familyId);
  return (
    <div>
      <PageHeader
        eyebrow="Osoby"
        title="Osoby w rodzinie"
        description="Zarządzaj osobami i ich podstawowymi informacjami."
        action={
          <Users className="hidden size-10 rounded-2xl bg-accent p-2 text-primary sm:block" />
        }
      />
      <PeopleWorkspace familyId={familyId} people={people} />
    </div>
  );
}
