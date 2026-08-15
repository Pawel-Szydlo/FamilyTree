import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { InvitationForm } from "@/features/invitations/components/invitation-form";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
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
          <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Mail className="size-6" />
          </div>
          <h1 className="text-3xl font-semibold text-primary">
            Dołącz do rodziny
          </h1>
          <p className="mt-2 text-muted-foreground">
            Dołącz do prywatnej rodziny po zalogowaniu.
          </p>
          {token ? (
            <div className="mt-8">
              <InvitationForm token={token} />
            </div>
          ) : (
            <Link
              href="/login"
              className={`${buttonVariants({ variant: "outline" })} mt-8 w-full`}
            >
              Przejdź do logowania
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
