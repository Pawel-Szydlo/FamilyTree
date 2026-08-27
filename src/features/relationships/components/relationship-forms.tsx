"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Person } from "@/features/people/queries";
import {
  createParentLink,
  createPartnership,
  type RelationshipActionState,
  updatePartnership,
} from "../actions";
import type { ParentLink, Partnership } from "../queries";

const initialState: RelationshipActionState = {};
const input =
  "mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";
const personLabel = (person: Person) =>
  person.preferred_name ||
  [person.first_name, person.last_name].filter(Boolean).join(" ") ||
  "Osoba bez nazwy";

function Feedback({ state }: { state: RelationshipActionState }) {
  return state.error ? (
    <p
      role="alert"
      className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
    >
      {state.error}
    </p>
  ) : null;
}

export function PartnershipForm({
  familyId,
  people,
  partnership,
  onDone,
}: {
  familyId: string;
  people: Person[];
  partnership?: Partnership;
  onDone: () => void;
}) {
  const action = partnership ? updatePartnership : createPartnership;
  const [state, formAction, pending] = useActionState(action, initialState);
  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);
  const [selected, setSelected] = useState(
    partnership?.members.map((member) => member.person_id) ?? [],
  );
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="family_id" value={familyId} />
      {partnership && (
        <input type="hidden" name="partnership_id" value={partnership.id} />
      )}
      <fieldset>
        <legend className="text-sm font-medium">Partnerzy</legend>
        <div className="mt-2 grid gap-2 rounded-2xl bg-muted/60 p-3 sm:grid-cols-2">
          {people.map((person) => (
            <label key={person.id} className="text-sm">
              <input
                type="checkbox"
                name="partner_ids"
                value={person.id}
                checked={selected.includes(person.id)}
                onChange={() =>
                  setSelected((current) =>
                    current.includes(person.id)
                      ? current.filter((id) => id !== person.id)
                      : [...current, person.id],
                  )
                }
                className="mr-2"
              />
              {personLabel(person)}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-medium">
        Typ
        <select
          name="partnership_type"
          defaultValue={partnership?.partnership_type ?? "relationship"}
          className={input}
        >
          <option value="marriage">Małżeństwo</option>
          <option value="partnership">Partnerstwo</option>
          <option value="relationship">Związek</option>
        </select>
      </label>
      <label className="block text-sm font-medium">
        Status
        <select
          name="status"
          defaultValue={partnership?.status ?? "unknown"}
          className={input}
        >
          <option value="active">Aktywny</option>
          <option value="ended">Zakończony</option>
          <option value="divorced">Rozwiedziony</option>
          <option value="widowed">Wdowieństwo</option>
          <option value="unknown">Nieznany</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Od
          <input
            name="start_date"
            type="date"
            defaultValue={partnership?.start_date ?? ""}
            className={input}
          />
        </label>
        <label className="text-sm font-medium">
          Do
          <input
            name="end_date"
            type="date"
            defaultValue={partnership?.end_date ?? ""}
            className={input}
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Notatka
        <textarea
          name="notes"
          rows={3}
          defaultValue={partnership?.notes ?? ""}
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <Feedback state={state} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Zapisywanie…"
          : partnership
            ? "Zapisz związek"
            : "Dodaj związek"}
      </Button>
    </form>
  );
}

export function ParentLinkForm({
  familyId,
  people,
  partnerships,
  onDone,
}: {
  familyId: string;
  people: Person[];
  partnerships: Partnership[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    createParentLink,
    initialState,
  );
  const [source, setSource] = useState<"person" | "partnership">("person");
  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="family_id" value={familyId} />
      <label className="block text-sm font-medium">
        Dziecko
        <select name="child_person_id" className={input} required>
          <option value="">Wybierz osobę</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {personLabel(person)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Źródło rodzica
        <select
          name="parent_source"
          value={source}
          onChange={(event) =>
            setSource(event.target.value as "person" | "partnership")
          }
          className={input}
        >
          <option value="person">Jedna osoba</option>
          <option value="partnership">Związek / rodzina rodziców</option>
        </select>
      </label>
      {source === "person" ? (
        <label className="block text-sm font-medium">
          Rodzic
          <select name="parent_person_id" className={input}>
            <option value="">Wybierz rodzica</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {personLabel(person)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="block text-sm font-medium">
          Związek
          <select name="parent_partnership_id" className={input}>
            <option value="">Wybierz związek</option>
            {partnerships.map((partnership) => (
              <option key={partnership.id} value={partnership.id}>
                {partnership.members
                  .map((member) =>
                    people.find((person) => person.id === member.person_id),
                  )
                  .filter(Boolean)
                  .map((person) => personLabel(person as Person))
                  .join(" + ") || "Związek bez nazw"}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm font-medium">
        Typ relacji
        <select
          name="relation_type"
          defaultValue="biological"
          className={input}
        >
          <option value="biological">Biologiczna</option>
          <option value="adoptive">Adopcyjna</option>
          <option value="foster">Opiekuńcza</option>
          <option value="step">Przybrana</option>
          <option value="guardian">Opiekun prawny</option>
          <option value="unknown">Nieznana</option>
        </select>
      </label>
      <label className="block text-sm font-medium">
        Pewność
        <select name="status" defaultValue="confirmed" className={input}>
          <option value="confirmed">Potwierdzona</option>
          <option value="probable">Prawdopodobna</option>
          <option value="unknown">Nieznana</option>
        </select>
      </label>
      <Feedback state={state} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Zapisywanie…" : "Dodaj relację"}
      </Button>
    </form>
  );
}

export function RelationshipsWorkspace({
  familyId,
  people,
  partnerships,
  parentLinks,
}: {
  familyId: string;
  people: Person[];
  partnerships: Partnership[];
  parentLinks: ParentLink[];
}) {
  const [mode, setMode] = useState<"partnership" | "parent">("partnership");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partnership | undefined>();
  const personName = (id: string) => {
    const person = people.find((item) => item.id === id);
    return person ? personLabel(person) : "Usunięta osoba";
  };
  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === "partnership" ? "default" : "secondary"}
          onClick={() => setMode("partnership")}
        >
          Związki
        </Button>
        <Button
          variant={mode === "parent" ? "default" : "secondary"}
          onClick={() => setMode("parent")}
        >
          Rodzice i dzieci
        </Button>
        <Button
          className="ml-auto"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          Dodaj relację
        </Button>
      </div>
      {mode === "partnership" ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {partnerships.map((partnership) => (
            <article
              key={partnership.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="font-semibold text-primary">
                {partnership.members
                  .map((member) => personName(member.person_id))
                  .join(" + ")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {partnership.partnership_type} · {partnership.status}
              </p>
              <Button
                variant="ghost"
                className="mt-3"
                onClick={() => {
                  setEditing(partnership);
                  setOpen(true);
                }}
              >
                Edytuj
              </Button>
            </article>
          ))}
          {partnerships.length === 0 && (
            <Empty text="Nie ma jeszcze związków." />
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {parentLinks.map((link) => (
            <article
              key={link.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="font-semibold text-primary">
                {link.parent_person_id
                  ? personName(link.parent_person_id)
                  : "Związek"}{" "}
                → {personName(link.child_person_id)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {link.relation_type} · {link.status}
              </p>
            </article>
          ))}
          {parentLinks.length === 0 && (
            <Empty text="Nie ma jeszcze relacji rodzic–dziecko." />
          )}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 bg-primary/20">
          <section
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-background p-5 shadow-2xl sm:max-w-xl sm:p-8 max-sm:top-auto max-sm:h-[92vh] max-sm:rounded-t-3xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-primary">
                {mode === "partnership"
                  ? editing
                    ? "Edytuj związek"
                    : "Dodaj związek"
                  : "Dodaj relację rodzic–dziecko"}
              </h2>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Zamknij
              </Button>
            </div>
            <div className="mt-6">
              {mode === "partnership" ? (
                <PartnershipForm
                  familyId={familyId}
                  people={people}
                  partnership={editing}
                  onDone={() => setOpen(false)}
                />
              ) : (
                <ParentLinkForm
                  familyId={familyId}
                  people={people}
                  partnerships={partnerships}
                  onDone={() => setOpen(false)}
                />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
