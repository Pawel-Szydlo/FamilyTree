import { Plus, Search, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export default function TreePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Drzewo rodziny"
        title="Kowalscy"
        description="Zobacz, jak łączą się historie Twojej rodziny."
        action={
          <Button>
            <Plus />
            Dodaj osobę
          </Button>
        }
      />
      <div className="px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
              placeholder="Szukaj osoby..."
            />
          </label>
          <div className="flex gap-2">
            <Button variant="secondary">Moja gałąź</Button>
            <Button variant="outline">Cała rodzina</Button>
          </div>
        </div>
        <div className="mt-6 min-h-[480px] overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex min-h-[480px] items-center justify-center bg-[radial-gradient(circle_at_center,oklch(0.94_0.04_88)_1px,transparent_1px)] [background-size:24px_24px]">
            <div className="max-w-sm px-6 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-accent text-accent-foreground">
                <Sparkles className="size-7" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-primary">
                Twoje drzewo zaczyna się tutaj
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                W kolejnym etapie dodamy interaktywny graf osób, związków i
                relacji rodzinnych.
              </p>
              <Button className="mt-5">
                <Plus />
                Dodaj pierwszą osobę
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
