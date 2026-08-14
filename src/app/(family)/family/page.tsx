import { ArrowRight, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CreateFamilyForm } from "@/features/families/components/create-family-form";
import { getCurrentUser, getFamilies } from "@/features/families/queries";

export default async function FamilyHubPage() {
  const [user, families] = await Promise.all([getCurrentUser(), getFamilies()]);

  if (!user) return null;

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-3 text-primary">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="size-5 fill-current" />
          </span>
          <span className="text-lg font-semibold">FamilyTree</span>
        </div>
        <div className="mt-14 max-w-2xl">
          <p className="text-sm font-medium text-primary/70">
            Witaj, {user.email}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-primary">
            Wybierz swoją rodzinę
          </h1>
          <p className="mt-3 text-muted-foreground">
            Możesz należeć do wielu niezależnych rodzin. Wybierz jedną albo
            utwórz nowe drzewo.
          </p>
        </div>
        {families.length > 0 && (
          <section className="mt-9 grid gap-4 sm:grid-cols-2">
            {families.map((family) => (
              <Link
                key={family.id}
                href={`/family/${family.id}/tree`}
                className="group rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-2xl bg-accent text-2xl">
                    🌿
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-primary">
                  {family.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Otwórz drzewo rodziny
                </p>
              </Link>
            ))}
          </section>
        )}
        <section className="mt-8 grid gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
              <Plus className="size-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-primary">
              Utwórz nową rodzinę
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Zacznij od nazwy, a później zaproś bliskich i dodaj pierwsze
              osoby.
            </p>
          </div>
          <CreateFamilyForm />
        </section>
        <Link
          href="/"
          className={`${buttonVariants({ variant: "ghost" })} mt-8`}
        >
          Wróć na stronę główną
        </Link>
      </div>
    </main>
  );
}
