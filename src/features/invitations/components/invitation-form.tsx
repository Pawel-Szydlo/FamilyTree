"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { acceptInvitation, type InvitationActionState } from "../actions";

const initialState: InvitationActionState = {};

export function InvitationForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    acceptInvitation,
    initialState,
  );
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      <Button className="w-full" disabled={pending}>
        {pending ? "Dołączanie…" : "Dołącz do rodziny"}
      </Button>
    </form>
  );
}
