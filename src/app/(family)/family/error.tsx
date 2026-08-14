"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FamilyHubError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-primary">
          Nie udało się wczytać rodzin
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sprawdź połączenie i spróbuj ponownie. Twoje dane nie zostały
          zmienione.
        </p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw />
          Spróbuj ponownie
        </Button>
      </div>
    </main>
  );
}
