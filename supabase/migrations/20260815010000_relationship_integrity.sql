-- Relationships are graph data. Keep the graph safe even when a client bypasses
-- the application-level validation.
create unique index parent_links_direct_unique
  on public.parent_links (family_id, parent_person_id, child_person_id)
  where parent_person_id is not null;

create unique index parent_links_partnership_unique
  on public.parent_links (family_id, parent_partnership_id, child_person_id)
  where parent_partnership_id is not null;

create or replace function public.prevent_parent_cycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate_parent uuid;
begin
  if new.parent_person_id is not null then
    if new.parent_person_id = new.child_person_id then
      raise exception 'Parent relationship cannot point to the same person';
    end if;
    candidate_parent := new.parent_person_id;
  else
    if exists (
      select 1 from public.partnership_members
      where partnership_id = new.parent_partnership_id
        and person_id = new.child_person_id
    ) then
      raise exception 'Parent relationship cannot point to a partnership containing the child';
    end if;
  end if;

  if exists (
    with recursive graph(parent_id, child_id) as (
      select parent_person_id, child_person_id from public.parent_links where id <> new.id
      union all
      select pm.person_id, pl.child_person_id
      from public.parent_links pl
      join public.partnership_members pm on pm.partnership_id = pl.parent_partnership_id
      where pl.id <> new.id
    ), walk(parent_id, child_id, path) as (
      select parent_id, child_id, array[parent_id, child_id] from graph where parent_id is not null
      union all
      select walk.parent_id, graph.child_id, walk.path || graph.child_id
      from walk join graph on graph.parent_id = walk.child_id
      where not graph.child_id = any(walk.path)
    )
    select 1
    from walk
    where walk.parent_id = new.child_person_id
      and (candidate_parent is not null and walk.child_id = candidate_parent
        or candidate_parent is null and exists (
          select 1 from public.partnership_members pm
          where pm.partnership_id = new.parent_partnership_id and pm.person_id = walk.child_id
        ))
  ) then
    raise exception 'Parent relationship would create a cycle';
  end if;
  return new;
end;
$$;

create trigger prevent_parent_cycle
before insert or update on public.parent_links
for each row execute function public.prevent_parent_cycle();

create policy partnership_members_update_editor on public.partnership_members
for update using (exists (select 1 from public.partnerships p where p.id = partnership_id and public.has_family_role(p.family_id, array['owner', 'admin', 'editor']::public.family_member_role[])))
with check (exists (select 1 from public.partnerships p where p.id = partnership_id and public.has_family_role(p.family_id, array['owner', 'admin', 'editor']::public.family_member_role[])));
