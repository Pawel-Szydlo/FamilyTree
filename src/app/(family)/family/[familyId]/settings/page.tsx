import { ShieldCheck, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Twoja rodzina"
        title="Ustawienia"
        description="Zarządzaj rodziną, członkami i prywatnością danych."
      />
      <div className="grid gap-5 px-5 py-6 sm:px-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6">
          <UsersRound className="size-6 text-primary" />
          <h2 className="mt-4 font-semibold text-primary">
            Członkowie rodziny
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Zaproszenia i role członków pojawią się tutaj.
          </p>
        </section>
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
