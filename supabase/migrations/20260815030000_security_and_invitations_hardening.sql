-- Do not expose private/restricted relationship metadata through join tables.
drop policy if exists memory_people_select_member on public.memory_people;
create policy memory_people_select_visible on public.memory_people
for select using (
  exists (
    select 1 from public.memories m
    where m.id = memory_id
      and public.is_family_member(m.family_id)
      and (m.visibility = 'family' or m.created_by = auth.uid() or public.has_family_role(m.family_id, array['owner', 'admin']::public.family_member_role[]))
  )
);

drop policy if exists photo_people_select_member on public.photo_people;
create policy photo_people_select_visible on public.photo_people
for select using (
  exists (
    select 1 from public.photos p
    where p.id = photo_id
      and public.is_family_member(p.family_id)
      and (p.visibility = 'family' or p.uploaded_by = auth.uid() or public.has_family_role(p.family_id, array['owner', 'admin']::public.family_member_role[]))
  )
);

-- A private bucket is not enough: Storage must also honor the photo visibility.
drop policy if exists family_private_select_member on storage.objects;
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

create or replace function public.accept_invitation(target_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.invitations;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to accept an invitation';
  end if;

  select * into invitation
  from public.invitations
  where token_hash = target_token_hash
    and status = 'pending'
    and expires_at > now()
  for update;

  if invitation.id is null then
    raise exception 'Invitation is invalid or expired';
  end if;

  insert into public.family_members (family_id, user_id, role, status)
  values (invitation.family_id, auth.uid(), invitation.role, 'active')
  on conflict (family_id, user_id) do nothing;

  update public.invitations
  set status = 'accepted', accepted_at = now(), updated_at = now()
  where id = invitation.id;

  return invitation.family_id;
end;
$$;

grant execute on function public.accept_invitation(text) to authenticated;
