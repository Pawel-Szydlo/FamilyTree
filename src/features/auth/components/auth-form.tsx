"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up" | "reset";

function safeRedirect(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/family";
}

export function AuthForm({ redirectTo }: { redirectTo?: string }) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isReset = mode === "reset";
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const redirect = safeRedirect(redirectTo);
    let errorMessage: string | null = null;
    let hasSession = false;

    if (isReset) {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      errorMessage = result.error?.message ?? null;
    } else if (isSignUp) {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });
      errorMessage = result.error?.message ?? null;
      hasSession = Boolean(result.data.session);
    } else {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      errorMessage = result.error?.message ?? null;
      hasSession = Boolean(result.data.session);
    }

    setPending(false);

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    if (isReset) {
      setMessage(
        "Link do ustawienia nowego hasła został wysłany na podany adres.",
      );
      return;
    }

    if (isSignUp && !hasSession) {
      setMessage(
        "Konto utworzone. Sprawdź skrzynkę e-mail, aby potwierdzić adres.",
      );
      return;
    }

    window.location.assign(redirect);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">
          {isReset
            ? "Odzyskaj dostęp"
            : isSignUp
              ? "Utwórz konto"
              : "Witaj z powrotem"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isReset
            ? "Wyślemy Ci bezpieczny link do ustawienia nowego hasła."
            : isSignUp
              ? "Zacznij budować prywatne drzewo swojej rodziny."
              : "Zaloguj się, aby wrócić do swojej rodziny."}
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-primary">
          Adres e-mail
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ty@przyklad.pl"
            autoComplete="email"
            className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </label>
        {!isReset && (
          <label className="block text-sm font-medium text-primary">
            Hasło
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 znaków"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </label>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {message && (
          <output
            aria-live="polite"
            className="rounded-xl bg-secondary p-3 text-sm text-primary"
          >
            {message}
          </output>
        )}
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <LockKeyhole />
          )}
          {isReset ? "Wyślij link" : isSignUp ? "Utwórz konto" : "Zaloguj się"}
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-muted-foreground">
        {!isReset && !isSignUp && (
          <button
            type="button"
            onClick={() => setMode("reset")}
            className="hover:text-primary"
          >
            Nie pamiętasz hasła?
          </button>
        )}
        {!isReset && (
          <button
            type="button"
            onClick={() => setMode(isSignUp ? "sign-in" : "sign-up")}
            className="hover:text-primary"
          >
            {isSignUp
              ? "Masz już konto? Zaloguj się"
              : "Nie masz jeszcze konta? Zarejestruj się"}
          </button>
        )}
        {isReset && (
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className="hover:text-primary"
          >
            Wróć do logowania
          </button>
        )}
      </div>
    </div>
  );
}
