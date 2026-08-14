import { BookHeart, ImagePlus, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export default function MemoriesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Rodzinny album"
        title="Wspomnienia"
        description="Zdjęcia, historie i wydarzenia, do których warto wracać."
        action={
          <Button>
            <Plus />
            Dodaj wspomnienie
          </Button>
        }
      />
      <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-6 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <ImagePlus className="size-6" />
          </div>
          <h2 className="mt-4 font-semibold text-primary">
            Dodaj pierwsze wspomnienie
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            W kolejnym etapie dodasz zdjęcia i historie przypisane do osób.
          </p>
        </div>
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-secondary/50 p-6 text-center">
          <BookHeart className="size-8 text-primary/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            Album jest jeszcze pusty.
          </p>
        </div>
      </div>
    </div>
  );
}
