"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  createInvitation,
  type InvitationActionState,
  revokeInvitation,
} from "@/features/invitations/actions";
import type {
  InvitationRecord,
  MemberRecord,
} from "@/features/invitations/queries";
import {
  type MemberActionState,
  removeMember,
  updateMemberRole,
} from "../actions";

const emptyInvitation: InvitationActionState = {};
const emptyMember: MemberActionState = {};
const roleLabels = {
  owner: "Owner",
  admin: "Administrator",
  editor: "Edytor",
  member: "Członek",
  viewer: "Obserwator",
};

function ActionMessage({ message }: { message?: string }) {
  return message ? (
    <p
      role="alert"
      className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
    >
      {message}
    </p>
  ) : null;
}

export function MembersWorkspace({
  familyId,
  members,
  invitations,
}: {
  familyId: string;
  members: MemberRecord[];
  invitations: InvitationRecord[];
}) {
  const [inviteState, inviteAction, invitePending] = useActionState(
    createInvitation,
    emptyInvitation,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeInvitation,
    emptyInvitation,
  );
  return (
    <div className="grid gap-5 px-5 py-6 sm:px-8 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">
          Członkowie rodziny
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tylko owner i administrator mogą zmieniać role lub usuwać członków.
        </p>
        <div className="mt-5 divide-y divide-border">
          {members.map((member) => (
            <MemberRow
              key={member.user_id}
              familyId={familyId}
              member={member}
            />
          ))}
        </div>
      </section>
      <div className="space-y-5">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-primary">Zaproś osobę</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Link jest jednorazowy i wygasa po 7 dniach.
          </p>
          <form action={inviteAction} className="mt-5 space-y-3">
            <input type="hidden" name="family_id" value={familyId} />
            <input
              required
              type="email"
              name="email"
              placeholder="adres@przyklad.pl"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <select
              name="role"
              defaultValue="member"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="admin">Administrator</option>
              <option value="editor">Edytor</option>
              <option value="member">Członek</option>
              <option value="viewer">Obserwator</option>
            </select>
            <Button className="w-full" disabled={invitePending}>
              {invitePending ? "Wysyłanie…" : "Wyślij zaproszenie"}
            </Button>
          </form>
          <ActionMessage message={inviteState.error} />
        </section>
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-primary">
            Ostatnie zaproszenia
          </h2>
          <div className="mt-4 space-y-3">
            {invitations.length ? (
              invitations.slice(0, 8).map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">
                      {invitation.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabels[invitation.role]} ·{" "}
                      {invitation.status === "pending"
                        ? "Oczekuje"
                        : invitation.status}
                    </p>
                  </div>
                  {invitation.status === "pending" &&
                    new Date(invitation.expires_at) > new Date() && (
                      <form action={revokeAction}>
                        <input
                          type="hidden"
                          name="family_id"
                          value={familyId}
                        />
                        <input
                          type="hidden"
                          name="invitation_id"
                          value={invitation.id}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={revokePending}
                        >
                          Unieważnij
                        </Button>
                      </form>
                    )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Brak zaproszeń.</p>
            )}
          </div>
          <ActionMessage message={revokeState.error} />
        </section>
      </div>
    </div>
  );
}

function MemberRow({
  familyId,
  member,
}: {
  familyId: string;
  member: MemberRecord;
}) {
  const [roleState, roleAction, rolePending] = useActionState(
    updateMemberRole,
    emptyMember,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeMember,
    emptyMember,
  );
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-primary">
          {member.email ?? "Użytkownik zaproszony"}
        </p>
        <p className="text-xs text-muted-foreground">
          {member.status === "active" ? "Aktywny" : "Zawieszony"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <form action={roleAction} className="flex items-center gap-2">
          <input type="hidden" name="family_id" value={familyId} />
          <input type="hidden" name="user_id" value={member.user_id} />
          <select
            name="role"
            defaultValue={member.role}
            disabled={rolePending}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
          >
            {Object.entries(roleLabels).map(([role, label]) => (
              <option key={role} value={role}>
                {label}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" disabled={rolePending}>
            Zapisz
          </Button>
        </form>
        <form
          action={removeAction}
          onSubmit={(event) => {
            if (!window.confirm("Usunąć tego członka z rodziny?"))
              event.preventDefault();
          }}
        >
          <input type="hidden" name="family_id" value={familyId} />
          <input type="hidden" name="user_id" value={member.user_id} />
          <Button size="sm" variant="ghost" disabled={removePending}>
            Usuń
          </Button>
        </form>
      </div>
      <ActionMessage message={roleState.error ?? removeState.error} />
    </div>
  );
}
