-- FamilyTree initial schema
-- Requires Supabase Auth (auth.users) and is safe to apply once to a new project.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.family_member_role as enum ('owner', 'admin', 'editor', 'member', 'viewer');
create type public.family_member_status as enum ('active', 'suspended');
create type public.person_privacy_level as enum ('family', 'restricted', 'private');
create type public.partnership_type as enum ('marriage', 'partnership', 'relationship');
create type public.partnership_status as enum ('active', 'ended', 'divorced', 'widowed', 'unknown');
create type public.partnership_member_role as enum ('partner', 'spouse', 'unknown');
create type public.parent_relation_type as enum ('biological', 'adoptive', 'foster', 'step', 'guardian', 'unknown');
create type public.parent_link_status as enum ('confirmed', 'probable', 'unknown');
create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');
create type public.memory_type as enum ('photo', 'story', 'event');
create type public.content_visibility as enum ('family', 'restricted', 'private');
create type public.notification_type as enum ('birthday_7_days', 'birthday_today');

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.family_member_role not null default 'member',
  status public.family_member_status not null default 'active',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 120),
  last_name text not null default '' check (char_length(last_name) <= 120),
  preferred_name text check (preferred_name is null or char_length(preferred_name) <= 120),
  birth_month smallint check (birth_month is null or birth_month between 1 and 12),
  birth_day smallint check (birth_day is null or birth_day between 1 and 31),
  birth_year smallint check (birth_year is null or birth_year between 1 and 3000),
  birth_year_visible boolean not null default false,
  is_living boolean not null default true,
  is_placeholder boolean not null default false,
  privacy_level public.person_privacy_level not null default 'family',
  biography text check (biography is null or char_length(biography) <= 10000),
  avatar_path text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, id),
  constraint people_name_or_placeholder check (
    is_placeholder or char_length(trim(first_name || ' ' || last_name)) > 0
  ),
  constraint people_birth_parts check (
    (birth_month is null and birth_day is null and birth_year is null)
    or (birth_month is not null and birth_day is not null)
  ),
  constraint people_birth_year_visibility check (birth_year is null or birth_year_visible or not is_living)
);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  partnership_type public.partnership_type not null default 'relationship',
  status public.partnership_status not null default 'unknown',
  start_date date,
  end_date date,
  notes text check (notes is null or char_length(notes) <= 5000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, id),
  constraint partnerships_dates check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.partnership_members (
  partnership_id uuid not null references public.partnerships(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  role public.partnership_member_role not null default 'partner',
  position smallint not null default 0 check (position >= 0),
  primary key (partnership_id, person_id)
);

create table public.parent_links (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  parent_person_id uuid references public.people(id) on delete cascade,
  parent_partnership_id uuid references public.partnerships(id) on delete cascade,
  child_person_id uuid not null references public.people(id) on delete cascade,
  relation_type public.parent_relation_type not null default 'unknown',
  status public.parent_link_status not null default 'unknown',
  notes text check (notes is null or char_length(notes) <= 5000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parent_links_one_parent_source check (num_nonnulls(parent_person_id, parent_partnership_id) = 1),
  constraint parent_links_family_parent check (
    parent_person_id is null or parent_partnership_id is null
  ),
  constraint parent_links_not_self check (parent_person_id is null or parent_person_id <> child_person_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  email citext not null,
  role public.family_member_role not null default 'member',
  status public.invitation_status not null default 'pending',
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitations_not_owner check (role <> 'owner')
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  type public.memory_type not null default 'story',
  title text not null check (char_length(trim(title)) between 1 and 200),
  body text check (body is null or char_length(body) <= 30000),
  memory_date date,
  visibility public.content_visibility not null default 'family',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, id)
);

create table public.memory_people (
  memory_id uuid not null references public.memories(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  primary key (memory_id, person_id)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  storage_path text not null unique,
  caption text check (caption is null or char_length(caption) <= 1000),
  taken_at date,
  visibility public.content_visibility not null default 'family',
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, id)
);

create table public.photo_people (
  photo_id uuid not null references public.photos(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  primary key (photo_id, person_id)
);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  enabled boolean not null default true,
  notify_7_days_before boolean not null default true,
  notify_on_day boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, user_id, person_id)
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  notification_type public.notification_type not null,
  birthday_year smallint not null check (birthday_year between 1 and 3000),
  sent_at timestamptz not null default now(),
  resend_message_id text,
  error_message text,
  unique (recipient_user_id, person_id, notification_type, birthday_year)
);

create or replace function public.validate_family_relationships()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  relationship_family uuid;
  person_family uuid;
begin
  if tg_table_name = 'partnership_members' then
    select family_id into relationship_family from public.partnerships where id = new.partnership_id;
    select family_id into person_family from public.people where id = new.person_id;
    if relationship_family is distinct from person_family then
      raise exception 'Partnership member must belong to the same family';
    end if;
  elsif tg_table_name = 'parent_links' then
    if new.parent_person_id is not null then
      select family_id into relationship_family from public.people where id = new.parent_person_id;
    else
      select family_id into relationship_family from public.partnerships where id = new.parent_partnership_id;
    end if;
    select family_id into person_family from public.people where id = new.child_person_id;
    if relationship_family is distinct from new.family_id or person_family is distinct from new.family_id then
      raise exception 'Parent link records must belong to the same family';
    end if;
  elsif tg_table_name = 'memory_people' then
    select family_id into relationship_family from public.memories where id = new.memory_id;
    select family_id into person_family from public.people where id = new.person_id;
    if relationship_family is distinct from person_family then
      raise exception 'Memory person records must belong to the same family';
    end if;
  elsif tg_table_name = 'photo_people' then
    select family_id into relationship_family from public.photos where id = new.photo_id;
    select family_id into person_family from public.people where id = new.person_id;
    if relationship_family is distinct from person_family then
      raise exception 'Photo person records must belong to the same family';
    end if;
  elsif tg_table_name = 'notification_preferences' then
    if new.person_id is not null then
      select family_id into person_family from public.people where id = new.person_id;
      if person_family is distinct from new.family_id then
        raise exception 'Notification preference person must belong to the same family';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_partnership_member_family
before insert or update on public.partnership_members
for each row execute function public.validate_family_relationships();

create trigger validate_parent_link_family
before insert or update on public.parent_links
for each row execute function public.validate_family_relationships();

create trigger validate_memory_person_family
before insert or update on public.memory_people
for each row execute function public.validate_family_relationships();

create trigger validate_photo_person_family
before insert or update on public.photo_people
for each row execute function public.validate_family_relationships();

create trigger validate_notification_preference_family
before insert or update on public.notification_preferences
for each row execute function public.validate_family_relationships();

create index family_members_user_idx on public.family_members (user_id, status);
create index people_family_birth_idx on public.people (family_id, birth_month, birth_day);
create index people_family_updated_idx on public.people (family_id, updated_at desc);
create index partnerships_family_idx on public.partnerships (family_id);
create index partnership_members_person_idx on public.partnership_members (person_id);
create index parent_links_family_child_idx on public.parent_links (family_id, child_person_id);
create index parent_links_family_parent_idx on public.parent_links (family_id, parent_person_id);
create index invitations_family_status_idx on public.invitations (family_id, status);
create index memories_family_date_idx on public.memories (family_id, memory_date desc);
create index memory_people_person_idx on public.memory_people (person_id);
create index photos_family_created_idx on public.photos (family_id, created_at desc);
create index photo_people_person_idx on public.photo_people (person_id);
create index notification_preferences_user_idx on public.notification_preferences (family_id, user_id);
create unique index notification_preferences_scope_unique
  on public.notification_preferences (family_id, user_id, coalesce(person_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index notification_logs_family_sent_idx on public.notification_logs (family_id, sent_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'families', 'family_members', 'people', 'partnerships', 'parent_links',
    'invitations', 'memories', 'photos', 'notification_preferences'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_updated_at', table_name
    );
  end loop;
end;
$$;

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.has_family_role(target_family_id uuid, allowed_roles public.family_member_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and user_id = auth.uid()
      and status = 'active'
      and role = any (allowed_roles)
  );
$$;

create or replace function public.add_family_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.family_members (family_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (family_id, user_id) do nothing;
  return new;
end;
$$;

create trigger families_add_owner
after insert on public.families
for each row execute function public.add_family_owner();

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.people enable row level security;
alter table public.partnerships enable row level security;
alter table public.partnership_members enable row level security;
alter table public.parent_links enable row level security;
alter table public.invitations enable row level security;
alter table public.memories enable row level security;
alter table public.memory_people enable row level security;
alter table public.photos enable row level security;
alter table public.photo_people enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_logs enable row level security;

create policy families_select_member on public.families for select using (public.is_family_member(id));
create policy families_insert_creator on public.families for insert with check (created_by = auth.uid());
create policy families_update_admin on public.families for update using (public.has_family_role(id, array['owner', 'admin']::public.family_member_role[])) with check (public.has_family_role(id, array['owner', 'admin']::public.family_member_role[]));
create policy families_delete_owner on public.families for delete using (public.has_family_role(id, array['owner']::public.family_member_role[]));

create policy family_members_select_member on public.family_members for select using (public.is_family_member(family_id));
create policy family_members_insert_admin_or_creator on public.family_members for insert with check (
  public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[])
  or exists (select 1 from public.families where id = family_id and created_by = auth.uid())
);
create policy family_members_update_admin on public.family_members for update using (public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[])) with check (public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));
create policy family_members_delete_admin on public.family_members for delete using (public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));

create policy people_select_member on public.people for select using (
  public.is_family_member(family_id)
  and (privacy_level = 'family' or created_by = auth.uid() or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]))
);
create policy people_insert_editor on public.people for insert with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]) and created_by = auth.uid());
create policy people_update_editor on public.people for update using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[])) with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));
create policy people_delete_editor on public.people for delete using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));

create policy partnerships_select_member on public.partnerships for select using (public.is_family_member(family_id));
create policy partnerships_insert_editor on public.partnerships for insert with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]) and created_by = auth.uid());
create policy partnerships_update_editor on public.partnerships for update using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[])) with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));
create policy partnerships_delete_editor on public.partnerships for delete using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));

create policy partnership_members_select_member on public.partnership_members for select using (exists (select 1 from public.partnerships p where p.id = partnership_id and public.is_family_member(p.family_id)));
create policy partnership_members_insert_editor on public.partnership_members for insert with check (exists (select 1 from public.partnerships p where p.id = partnership_id and public.has_family_role(p.family_id, array['owner', 'admin', 'editor']::public.family_member_role[])));
create policy partnership_members_delete_editor on public.partnership_members for delete using (exists (select 1 from public.partnerships p where p.id = partnership_id and public.has_family_role(p.family_id, array['owner', 'admin', 'editor']::public.family_member_role[])));

create policy parent_links_select_member on public.parent_links for select using (public.is_family_member(family_id));
create policy parent_links_insert_editor on public.parent_links for insert with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]) and created_by = auth.uid());
create policy parent_links_update_editor on public.parent_links for update using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[])) with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));
create policy parent_links_delete_editor on public.parent_links for delete using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));

create policy invitations_select_admin on public.invitations for select using (public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));
create policy invitations_insert_admin on public.invitations for insert with check (public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]) and invited_by = auth.uid());
create policy invitations_update_admin on public.invitations for update using (public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[])) with check (public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));

create policy memories_select_member on public.memories for select using (
  public.is_family_member(family_id)
  and (visibility = 'family' or created_by = auth.uid() or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]))
);
create policy memories_insert_editor on public.memories for insert with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]) and created_by = auth.uid());
create policy memories_update_editor on public.memories for update using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[])) with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));
create policy memories_delete_editor on public.memories for delete using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));

create policy memory_people_select_member on public.memory_people for select using (exists (select 1 from public.memories m where m.id = memory_id and public.is_family_member(m.family_id)));
create policy memory_people_insert_editor on public.memory_people for insert with check (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner', 'admin', 'editor']::public.family_member_role[])));
create policy memory_people_delete_editor on public.memory_people for delete using (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner', 'admin', 'editor']::public.family_member_role[])));

create policy photos_select_member on public.photos for select using (
  public.is_family_member(family_id)
  and (visibility = 'family' or uploaded_by = auth.uid() or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]))
);
create policy photos_insert_editor on public.photos for insert with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]) and uploaded_by = auth.uid());
create policy photos_update_editor on public.photos for update using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[])) with check (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));
create policy photos_delete_editor on public.photos for delete using (public.has_family_role(family_id, array['owner', 'admin', 'editor']::public.family_member_role[]));

create policy photo_people_select_member on public.photo_people for select using (exists (select 1 from public.photos p where p.id = photo_id and public.is_family_member(p.family_id)));
create policy photo_people_insert_editor on public.photo_people for insert with check (exists (select 1 from public.photos p where p.id = photo_id and public.has_family_role(p.family_id, array['owner', 'admin', 'editor']::public.family_member_role[])));
create policy photo_people_delete_editor on public.photo_people for delete using (exists (select 1 from public.photos p where p.id = photo_id and public.has_family_role(p.family_id, array['owner', 'admin', 'editor']::public.family_member_role[])));

create policy notification_preferences_select_self_or_admin on public.notification_preferences for select using (user_id = auth.uid() or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));
create policy notification_preferences_insert_self_or_admin on public.notification_preferences for insert with check ((user_id = auth.uid() and public.is_family_member(family_id)) or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));
create policy notification_preferences_update_self_or_admin on public.notification_preferences for update using (user_id = auth.uid() or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[])) with check (user_id = auth.uid() or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));
create policy notification_preferences_delete_self_or_admin on public.notification_preferences for delete using (user_id = auth.uid() or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));

create policy notification_logs_select_recipient_or_admin on public.notification_logs for select using (recipient_user_id = auth.uid() or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[]));
