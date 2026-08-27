"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  type CreateFamilyState,
  createFamily,
} from "@/features/families/actions";

const initialState: CreateFamilyState = {};

export function CreateFamilyForm() {
  const [state, formAction, pending] = useActionState(
    createFamily,
    initialState,
  );
  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium text-primary">
        Nazwa rodziny
        <input
          required
          name="name"
          minLength={2}
          maxLength={120}
          placeholder="np. Kowalscy"
          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
        />
      </label>
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "Tworzenie…" : "Utwórz rodzinę"}
      </Button>
    </form>
  );
}
