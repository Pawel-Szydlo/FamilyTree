"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const { error: updateError } = await createClient().auth.updateUser({
      password,
    });
    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Hasło zostało zmienione. Możesz teraz korzystać z FamilyTree.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-primary">
        Nowe hasło
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="Minimum 8 znaków"
          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
        />
      </label>
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
        {pending ? <LoaderCircle className="animate-spin" /> : <LockKeyhole />}
        Ustaw nowe hasło
      </Button>
    </form>
  );
}
