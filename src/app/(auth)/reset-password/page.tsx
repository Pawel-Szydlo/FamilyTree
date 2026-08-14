import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Wróć do logowania
        </Link>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/5 sm:p-9">
          <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="size-6 fill-current" />
          </div>
          <UpdatePasswordForm />
        </div>
      </div>
    </main>
  );
}
