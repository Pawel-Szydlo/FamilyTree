alter table public.people
  add column if not exists anonymized_at timestamptz,
  add column if not exists anonymized_by uuid references auth.users(id) on delete set null;

create or replace function public.can_view_person(target_person_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.people p
    where p.id = target_person_id
      and public.is_family_member(p.family_id)
      and (
        p.privacy_level = 'family'
        or p.created_by = auth.uid()
        or public.has_family_role(p.family_id, array['owner', 'admin']::public.family_member_role[])
      )
  );
$$;

grant execute on function public.can_view_person(uuid) to authenticated;

drop policy if exists people_select_member on public.people;
create policy people_select_visible on public.people
for select using (public.can_view_person(id));

create or replace view public.people_visible
with (security_invoker = true)
as
select
  id,
  family_id,
  first_name,
  last_name,
  preferred_name,
  biography,
  avatar_path,
  birth_day,
  birth_month,
  case
    when birth_year_visible or not is_living or created_by = auth.uid()
      or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[])
    then birth_year
    else null
  end as birth_year,
  case
    when birth_year_visible or not is_living or created_by = auth.uid()
      or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[])
    then birth_year_visible
    else false
  end as birth_year_visible,
  is_living,
  is_placeholder,
  privacy_level,
  archived_at,
  updated_at
from public.people;

grant select on public.people_visible to authenticated;

drop policy if exists partnership_select_member on public.partnerships;
drop policy if exists partnerships_select_member on public.partnerships;
create policy partnerships_select_visible on public.partnerships
for select using (
  public.is_family_member(family_id)
  and not exists (
    select 1
    from public.partnership_members pm
    join public.people p on p.id = pm.person_id
    where pm.partnership_id = partnerships.id
      and not public.can_view_person(p.id)
  )
);

drop policy if exists partnership_members_select_member on public.partnership_members;
create policy partnership_members_select_visible on public.partnership_members
for select using (
  exists (
    select 1 from public.partnerships p
    where p.id = partnership_id
      and public.is_family_member(p.family_id)
      and public.can_view_person(person_id)
  )
);

drop policy if exists parent_links_select_member on public.parent_links;
create policy parent_links_select_visible on public.parent_links
for select using (
  public.is_family_member(family_id)
  and public.can_view_person(child_person_id)
  and (
    parent_person_id is null
    or public.can_view_person(parent_person_id)
  )
);

drop policy if exists memory_people_select_visible on public.memory_people;
create policy memory_people_select_visible on public.memory_people
for select using (
  public.can_view_person(person_id)
  and exists (
    select 1 from public.memories m
    where m.id = memory_id
      and public.is_family_member(m.family_id)
      and (m.visibility = 'family' or m.created_by = auth.uid() or public.has_family_role(m.family_id, array['owner', 'admin']::public.family_member_role[]))
  )
);

drop policy if exists photo_people_select_visible on public.photo_people;
create policy photo_people_select_visible on public.photo_people
for select using (
  public.can_view_person(person_id)
  and exists (
    select 1 from public.photos p
    where p.id = photo_id
      and public.is_family_member(p.family_id)
      and (p.visibility = 'family' or p.uploaded_by = auth.uid() or public.has_family_role(p.family_id, array['owner', 'admin']::public.family_member_role[]))
  )
);

drop policy if exists family_private_select_visible on storage.objects;
create policy family_private_select_visible on storage.objects
for select using (
  bucket_id = 'family-private'
  and exists (
    select 1 from public.photos p
    where p.storage_path = name
      and p.family_id = (storage.foldername(name))[1]::uuid
      and public.is_family_member(p.family_id)
      and (p.visibility = 'family' or p.uploaded_by = auth.uid() or public.has_family_role(p.family_id, array['owner', 'admin']::public.family_member_role[]))
  )
);
