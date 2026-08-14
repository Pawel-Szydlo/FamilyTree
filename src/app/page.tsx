import { ArrowRight, Heart, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold text-primary"
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Heart className="size-5 fill-current" />
          </span>
          <span className="text-lg tracking-tight">FamilyTree</span>
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Zaloguj się
        </Link>
      </nav>
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
            <Sparkles className="size-4 text-primary" /> Rodzinne historie w
            jednym miejscu
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-primary sm:text-6xl">
            Twoja rodzina ma swoją opowieść.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            Zbuduj prywatne drzewo genealogiczne, zachowaj zdjęcia i
            wspomnienia, a o urodzinach bliskich pamiętaj bez wysiłku.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Zacznij tworzyć <ArrowRight />
            </Link>
            <Link
              href="/family/demo/tree"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Zobacz przykładowe drzewo
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            <LockKeyhole className="size-4 text-primary" /> Prywatne dla
            zaproszonej rodziny
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-5 rounded-[2.5rem] bg-primary/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-xl shadow-primary/10">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Twoja rodzina</p>
                <h2 className="text-xl font-semibold text-primary">
                  Drzewo Kowalskich
                </h2>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                12 osób
              </span>
            </div>
            <div className="relative my-7 grid min-h-64 place-items-center">
              <div className="absolute left-1/2 top-10 h-24 w-px bg-border" />
              <div className="absolute left-1/4 top-28 h-px w-1/2 bg-border" />
              <div className="absolute left-1/4 top-28 h-16 w-px bg-border" />
              <div className="absolute right-1/4 top-28 h-16 w-px bg-border" />
              <div className="relative z-10 rounded-2xl border border-primary/20 bg-background p-3 text-center shadow-md">
                <div className="mx-auto mb-2 grid size-14 place-items-center rounded-full bg-accent text-2xl">
                  👩🏻
                </div>
                <p className="font-medium text-primary">Anna Kowalska</p>
                <p className="text-xs text-muted-foreground">Ty</p>
              </div>
              <div className="absolute left-5 top-36 rounded-2xl border border-border bg-background p-2.5 text-center shadow-sm">
                <div className="mx-auto mb-1 grid size-10 place-items-center rounded-full bg-secondary text-lg">
                  👵🏻
                </div>
                <p className="text-xs font-medium">Maria</p>
              </div>
              <div className="absolute right-5 top-36 rounded-2xl border border-border bg-background p-2.5 text-center shadow-sm">
                <div className="mx-auto mb-1 grid size-10 place-items-center rounded-full bg-secondary text-lg">
                  👴🏻
                </div>
                <p className="text-xs font-medium">Jan</p>
              </div>
            </div>
            <div className="rounded-xl bg-secondary/70 p-3">
              <p className="text-sm font-medium text-primary">
                Najbliższe urodziny
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Maria — za 7 dni 🎂
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
