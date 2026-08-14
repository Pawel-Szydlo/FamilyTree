import { Bell, Cake, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Rodzinny rytm"
        title="Kalendarz"
        description="Najbliższe urodziny i ważne rodzinne daty w jednym miejscu."
      />
      <div className="grid gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <Cake className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">
                Najbliższe urodziny
              </h2>
              <p className="text-sm text-muted-foreground">
                Pojawią się, gdy dodasz osoby.
              </p>
            </div>
          </div>
          <div className="mt-7 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
            Brak zapisanych dat urodzin.
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">Miesiąc</h2>
              <p className="text-sm text-muted-foreground">
                Widok kalendarza będzie dostępny w kolejnym etapie.
              </p>
            </div>
          </div>
          <div className="mt-7 flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
            <Bell className="mr-2 size-4" />
            Powiadomienia skonfigurujemy później.
          </div>
        </section>
      </div>
    </div>
  );
}
