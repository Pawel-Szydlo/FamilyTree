"use client";

import { BookHeart, CalendarDays, ImagePlus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Person } from "@/features/people/queries";
import { createMemory, deleteMemory, type MemoryActionState } from "../actions";
import type { MemoryRecord } from "../queries";

const initialState: MemoryActionState = {};
const input =
  "mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";
const personName = (person: Person) =>
  person.preferred_name ||
  [person.first_name, person.last_name].filter(Boolean).join(" ") ||
  "Osoba bez nazwy";
const typeLabel = {
  photo: "Zdjęcie",
  story: "Historia",
  event: "Wydarzenie",
} as const;

function MemoryForm({
  familyId,
  people,
  onDone,
}: {
  familyId: string;
  people: Person[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    createMemory,
    initialState,
  );
  const [type, setType] = useState<MemoryRecord["type"]>("photo");
  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="family_id" value={familyId} />
      <label className="block text-sm font-medium">
        Tytuł
        <input
          name="title"
          required
          maxLength={200}
          className={input}
          placeholder="np. Wakacje nad morzem"
        />
      </label>
      <label className="block text-sm font-medium">
        Typ
        <select
          name="type"
          value={type}
          onChange={(event) =>
            setType(event.target.value as MemoryRecord["type"])
          }
          className={input}
        >
          <option value="photo">Zdjęcie</option>
          <option value="story">Historia</option>
          <option value="event">Wydarzenie</option>
        </select>
      </label>
      {type === "photo" && (
        <label className="block text-sm font-medium">
          Plik zdjęcia
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            className="mt-1 block w-full rounded-xl border border-input bg-background p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            JPG, PNG, WebP lub GIF, maksymalnie 10 MB.
          </span>
        </label>
      )}
      <label className="block text-sm font-medium">
        Opis
        <textarea
          name="body"
          rows={4}
          maxLength={30000}
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          placeholder="Dodaj kontekst lub historię…"
        />
      </label>
      <label className="block text-sm font-medium">
        Data
        <input name="memory_date" type="date" className={input} />
      </label>
      <label className="block text-sm font-medium">
        Widoczność
        <select name="visibility" defaultValue="family" className={input}>
          <option value="family">Rodzina</option>
          <option value="restricted">Ograniczona</option>
          <option value="private">Prywatna</option>
        </select>
      </label>
      <fieldset>
        <legend className="text-sm font-medium">Powiązane osoby</legend>
        <div className="mt-2 grid max-h-36 gap-2 overflow-y-auto rounded-2xl bg-muted/60 p-3 sm:grid-cols-2">
          {people.map((person) => (
            <label key={person.id} className="text-sm">
              <input
                type="checkbox"
                name="person_ids"
                value={person.id}
                className="mr-2"
              />
              {personName(person)}
            </label>
          ))}
        </div>
      </fieldset>
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      <Button className="w-full" disabled={pending}>
        {pending ? "Zapisywanie…" : "Dodaj wspomnienie"}
      </Button>
    </form>
  );
}

function MemoryCard({
  memory,
  people,
  onOpen,
}: {
  memory: MemoryRecord;
  people: Person[];
  onOpen: () => void;
}) {
  const labels = memory.person_ids
    .map((id) => people.find((person) => person.id === id))
    .filter(Boolean)
    .map((person) => personName(person as Person));
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-3xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      {memory.photo?.signed_url ? (
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${memory.photo.signed_url})` }}
        />
      ) : (
        <div className="grid h-48 place-items-center bg-secondary/70 text-primary">
          {memory.type === "story" ? (
            <BookHeart className="size-10" />
          ) : (
            <CalendarDays className="size-10" />
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-primary/65">
            {typeLabel[memory.type]}
          </span>
          {memory.memory_date && (
            <span className="text-xs text-muted-foreground">
              {memory.memory_date}
            </span>
          )}
        </div>
        <h2 className="mt-2 truncate text-lg font-semibold text-primary">
          {memory.title}
        </h2>
        {memory.body && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {memory.body}
          </p>
        )}
        {labels.length > 0 && (
          <p className="mt-3 truncate text-xs text-muted-foreground">
            {labels.join(", ")}
          </p>
        )}
      </div>
    </button>
  );
}

function MemoryDetails({
  familyId,
  memory,
  people,
  onClose,
}: {
  familyId: string;
  memory: MemoryRecord;
  people: Person[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deleteMemory,
    initialState,
  );
  useEffect(() => {
    if (state.success) {
      onClose();
      router.refresh();
    }
  }, [onClose, router, state.success]);
  const labels = memory.person_ids
    .map((id) => people.find((person) => person.id === id))
    .filter(Boolean)
    .map((person) => personName(person as Person));
  return (
    <div className="fixed inset-0 z-50 bg-primary/20">
      <section
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-background p-5 shadow-2xl sm:max-w-xl sm:p-8 max-sm:top-auto max-sm:h-[92vh] max-sm:rounded-t-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary/70">
              {typeLabel[memory.type]}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-primary">
              {memory.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Zamknij"
          >
            <X />
          </Button>
        </div>
        {memory.photo?.signed_url && (
          <div
            className="mt-6 aspect-video rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${memory.photo.signed_url})` }}
          />
        )}
        {memory.body && (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {memory.body}
          </p>
        )}
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Data</dt>
            <dd className="mt-1 font-medium">
              {memory.memory_date ?? "Nie podano"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Widoczność</dt>
            <dd className="mt-1 font-medium">{memory.visibility}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Powiązane osoby</dt>
            <dd className="mt-1 font-medium">
              {labels.length ? labels.join(", ") : "Brak powiązanych osób"}
            </dd>
          </div>
        </dl>
        <form action={formAction}>
          {/* The server action receives only family and memory identifiers. */}
          <input type="hidden" name="family_id" value={familyId} />
          <input type="hidden" name="memory_id" value={memory.id} />
          {state.error && (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {state.error}
            </p>
          )}
          <Button variant="destructive" disabled={pending}>
            <Trash2 />
            {pending ? "Usuwanie…" : "Usuń wspomnienie"}
          </Button>
        </form>
      </section>
    </div>
  );
}

export function MemoryWorkspace({
  familyId,
  memories,
  people,
}: {
  familyId: string;
  memories: MemoryRecord[];
  people: Person[];
}) {
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<MemoryRecord | null>(null);
  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)}>
          <ImagePlus />
          Dodaj wspomnienie
        </Button>
      </div>
      {memories.length === 0 ? (
        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
            <BookHeart className="size-6" />
          </div>
          <h2 className="mt-4 font-semibold text-primary">
            Album jest jeszcze pusty
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Dodaj zdjęcie, historię albo wydarzenie i przypisz je do kilku osób.
          </p>
          <Button className="mt-5" onClick={() => setAdding(true)}>
            <ImagePlus />
            Dodaj pierwsze wspomnienie
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              people={people}
              onOpen={() => setSelected(memory)}
            />
          ))}
        </div>
      )}
      {(adding || selected) && (
        <div>
          {adding && (
            <div className="fixed inset-0 z-50 bg-primary/20">
              <section
                role="dialog"
                aria-modal="true"
                className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-background p-5 shadow-2xl sm:max-w-xl sm:p-8 max-sm:top-auto max-sm:h-[92vh] max-sm:rounded-t-3xl"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-primary">
                    Dodaj wspomnienie
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAdding(false)}
                    aria-label="Zamknij"
                  >
                    <X />
                  </Button>
                </div>
                <div className="mt-6">
                  <MemoryForm
                    familyId={familyId}
                    people={people}
                    onDone={() => {
                      setAdding(false);
                      window.location.reload();
                    }}
                  />
                </div>
              </section>
            </div>
          )}
          {selected && (
            <MemoryDetails
              familyId={familyId}
              memory={selected}
              people={people}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
