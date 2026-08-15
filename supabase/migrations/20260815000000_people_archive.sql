-- Keep people recoverable instead of hard-deleting records that may later be
-- referenced by relationships, memories, photos, or notifications.
alter table public.people
  add column archived_at timestamptz,
  add column archived_by uuid references auth.users(id) on delete set null;

create index people_family_archived_idx on public.people (family_id, archived_at);
