"use client";

import { Archive, Pencil, Plus, Search, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { archivePerson } from "../actions";
import type { Person } from "../queries";
import { PersonForm } from "./person-form";

function personName(person: Person) {
  return (
    person.preferred_name ||
    [person.first_name, person.last_name].filter(Boolean).join(" ") ||
    "Osoba bez nazwy"
  );
}

function birthLabel(person: Person) {
  if (!person.birth_day || !person.birth_month) return "Brak daty urodzenia";
  return `${person.birth_day}.${String(person.birth_month).padStart(2, "0")}${person.birth_year && person.birth_year_visible ? `.${person.birth_year}` : ""}`;
}

export function PeopleWorkspace({
  familyId,
  people,
}: {
  familyId: string;
  people: Person[];
}) {
  const [selected, setSelected] = useState<Person | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const visiblePeople = useMemo(
    () =>
      people.filter((person) =>
        personName(person)
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
      ),
    [people, query],
  );
  const close = () => {
    setSelected(null);
    setEditing(false);
    setAdding(false);
  };
  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
            placeholder="Szukaj osoby..."
          />
        </label>
        <Button onClick={() => setAdding(true)}>
          <Plus />
          Dodaj osobę
        </Button>
      </div>
      {visiblePeople.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <UserRound className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-primary">
            Nie ma jeszcze osób
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dodaj pierwszą osobę, aby rozpocząć drzewo.
          </p>
          <Button className="mt-5" onClick={() => setAdding(true)}>
            <Plus />
            Dodaj osobę
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePeople.map((person) => (
            <button
              type="button"
              key={person.id}
              onClick={() => setSelected(person)}
              className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-primary">
                  <UserRound />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-primary">
                    {personName(person)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {birthLabel(person)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
                <span>{person.is_living ? "Żyjąca" : "Zmarła"}</span>
                {person.is_placeholder && <span>• Placeholder</span>}
              </div>
            </button>
          ))}
        </div>
      )}
      {(selected || adding) && (
        <div className="fixed inset-0 z-50 bg-primary/20">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={
              adding
                ? "Dodaj osobę"
                : `Szczegóły: ${selected ? personName(selected) : ""}`
            }
            className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-background p-5 shadow-2xl sm:max-w-xl sm:p-8 max-sm:top-auto max-sm:h-[92vh] max-sm:rounded-t-3xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary/70">
                  {adding ? "Nowa osoba" : "Szczegóły osoby"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-primary">
                  {adding ? "Dodaj osobę" : selected && personName(selected)}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                aria-label="Zamknij"
              >
                <X />
              </Button>
            </div>
            {adding ? (
              <div className="mt-6">
                <PersonForm familyId={familyId} onDone={close} />
              </div>
            ) : (
              selected &&
              (editing ? (
                <div className="mt-6">
                  <PersonForm
                    familyId={familyId}
                    person={selected}
                    onDone={close}
                  />
                </div>
              ) : (
                <PersonDetails
                  person={selected}
                  onEdit={() => setEditing(true)}
                  onArchive={close}
                />
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function PersonDetails({
  person,
  onEdit,
  onArchive,
}: {
  person: Person;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const [message, setMessage] = useState("");
  async function archive() {
    if (
      !window.confirm(
        "Przenieść tę osobę do archiwum? Dane pozostaną zachowane, a relacje będzie można obsłużyć w kolejnym etapie.",
      )
    )
      return;
    const data = new FormData();
    data.set("family_id", person.family_id);
    data.set("person_id", person.id);
    data.set("expected_updated_at", person.updated_at);
    const result = await archivePerson({}, data);
    setMessage(result.error ?? result.success ?? "");
    if (result.success) onArchive();
  }
  return (
    <div className="mt-6 space-y-6">
      <div className="grid size-24 place-items-center rounded-3xl bg-accent text-primary">
        <UserRound className="size-10" />
      </div>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Imię i nazwisko</dt>
          <dd className="mt-1 font-medium">{personName(person)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Data urodzenia</dt>
          <dd className="mt-1 font-medium">{birthLabel(person)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="mt-1 font-medium">
            {person.is_living ? "Osoba żyjąca" : "Osoba zmarła"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Widoczność</dt>
          <dd className="mt-1 font-medium">{person.privacy_level}</dd>
        </div>
      </dl>
      {person.biography && (
        <div>
          <h3 className="font-semibold text-primary">Biografia</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {person.biography}
          </p>
        </div>
      )}
      <div className="rounded-2xl border border-dashed border-border p-4">
        <h3 className="font-semibold text-primary">Relacje</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Miejsce na rodziców, partnerów i dzieci — zostanie uzupełnione w
          kolejnym etapie.
        </p>
      </div>
      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onEdit}>
          <Pencil />
          Edytuj
        </Button>
        <Button variant="destructive" onClick={archive}>
          <Archive />
          Archiwizuj
        </Button>
      </div>
    </div>
  );
}
