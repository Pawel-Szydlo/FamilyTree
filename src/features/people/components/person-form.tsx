"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createPerson, type PersonActionState, updatePerson } from "../actions";
import type { Person } from "../queries";

const initialState: PersonActionState = {};

export function PersonForm({
  familyId,
  person,
  onDone,
}: {
  familyId: string;
  person?: Person | null;
  onDone: () => void;
}) {
  const action = person ? updatePerson : createPerson;
  const [state, formAction, pending] = useActionState(action, initialState);
  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);
  const input =
    "mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="family_id" value={familyId} />
      {person && (
        <>
          <input type="hidden" name="person_id" value={person.id} />
          <input
            type="hidden"
            name="expected_updated_at"
            value={person.updated_at}
          />
        </>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Imię
          <input
            name="first_name"
            defaultValue={person?.first_name}
            className={input}
            placeholder="np. Jan"
          />
        </label>
        <label className="text-sm font-medium">
          Nazwisko
          <input
            name="last_name"
            defaultValue={person?.last_name}
            className={input}
            placeholder="np. Kowalski"
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Preferowane imię
        <input
          name="preferred_name"
          defaultValue={person?.preferred_name ?? ""}
          className={input}
          placeholder="np. Janek"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium">
          Dzień
          <input
            name="birth_day"
            type="number"
            min="1"
            max="31"
            defaultValue={person?.birth_day ?? ""}
            className={input}
          />
        </label>
        <label className="text-sm font-medium">
          Miesiąc
          <input
            name="birth_month"
            type="number"
            min="1"
            max="12"
            defaultValue={person?.birth_month ?? ""}
            className={input}
          />
        </label>
        <label className="text-sm font-medium">
          Rok (opcjonalnie)
          <input
            name="birth_year"
            type="number"
            min="1"
            max="3000"
            defaultValue={person?.birth_year ?? ""}
            className={input}
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Biografia
        <textarea
          name="biography"
          defaultValue={person?.biography ?? ""}
          rows={4}
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
        />
      </label>
      <label className="block text-sm font-medium">
        Zdjęcie
        <input
          name="avatar_path"
          defaultValue={person?.avatar_path ?? ""}
          className={input}
          placeholder="Ścieżka zdjęcia lub URL"
        />
      </label>
      <label className="block text-sm font-medium">
        Prywatność
        <select
          name="privacy_level"
          defaultValue={person?.privacy_level ?? "family"}
          className={input}
        >
          <option value="family">Rodzina</option>
          <option value="restricted">Ograniczona</option>
          <option value="private">Prywatna</option>
        </select>
      </label>
      <div className="grid gap-2 rounded-2xl bg-muted/60 p-3 text-sm">
        <label>
          <input
            type="checkbox"
            name="is_living"
            defaultChecked={person?.is_living ?? true}
            className="mr-2"
          />
          Osoba żyjąca
        </label>
        <label>
          <input
            type="checkbox"
            name="is_placeholder"
            defaultChecked={person?.is_placeholder ?? false}
            className="mr-2"
          />
          Osoba nieznana / placeholder
        </label>
        <label>
          <input
            type="checkbox"
            name="birth_year_visible"
            defaultChecked={person?.birth_year_visible ?? false}
            className="mr-2"
          />
          Pokazuj rok urodzenia rodzinie
        </label>
      </div>
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      <Button className="w-full" disabled={pending}>
        {pending ? "Zapisywanie…" : person ? "Zapisz zmiany" : "Dodaj osobę"}
      </Button>
    </form>
  );
}
