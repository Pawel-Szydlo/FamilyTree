import { ArrowLeft, Heart, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Wróć do strony głównej
        </Link>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/5 sm:p-9">
          <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="size-6 fill-current" />
          </div>
          <h1 className="text-3xl font-semibold text-primary">
            Witaj z powrotem
          </h1>
          <p className="mt-2 text-muted-foreground">
            Zaloguj się, aby wrócić do swojej rodziny.
          </p>
          <div className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-primary">
              Adres e-mail
              <input
                type="email"
                placeholder="ty@przyklad.pl"
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </label>
            <Button className="h-11 w-full" disabled>
              Zaloguj się <span className="text-xs opacity-70">(wkrótce)</span>
            </Button>
          </div>
          <div className="mt-7 flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-xs leading-5 text-muted-foreground">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
            Twoje rodzinne dane pozostają prywatne i są dostępne tylko dla
            zaproszonych osób.
          </div>
        </div>
      </div>
    </main>
  );
}
