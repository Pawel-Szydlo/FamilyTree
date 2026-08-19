import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getInvitationData } from "@/features/invitations/queries";
import { MembersWorkspace } from "@/features/members/components/members-workspace";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;
  const data = await getInvitationData(familyId);
  return (
    <div>
      <PageHeader
        eyebrow="Twoja rodzina"
        title="Ustawienia"
        description="Zarządzaj rodziną, członkami i prywatnością danych."
      />
      {data.canManage ? (
        <MembersWorkspace familyId={familyId} {...data} />
      ) : (
        <div className="px-5 py-6 sm:px-8">
          <section className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Tylko owner i administrator mogą zarządzać członkami rodziny.
            </p>
          </section>
        </div>
      )}
      <div className="px-5 pb-6 sm:px-8">
        <section className="rounded-3xl border border-border bg-card p-6">
          <ShieldCheck className="size-6 text-primary" />
          <h2 className="mt-4 font-semibold text-primary">Prywatność</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Dane żyjących osób będą dostępne wyłącznie dla zaproszonej rodziny.
          </p>
        </section>
      </div>
    </div>
  );
}
