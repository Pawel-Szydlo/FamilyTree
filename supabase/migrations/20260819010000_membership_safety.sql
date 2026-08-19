create or replace function public.accept_invitation(target_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.invitations;
  current_email text;
begin
  if auth.uid() is null then
    raise exception 'Invitation is invalid or expired';
  end if;

  select email into current_email from auth.users where id = auth.uid();
  select * into invitation
  from public.invitations
  where token_hash = target_token_hash
    and status = 'pending'
    and expires_at > now()
    and lower(email::text) = lower(coalesce(current_email, ''))
  for update;

  if invitation.id is null then
    raise exception 'Invitation is invalid or expired';
  end if;

  insert into public.family_members (family_id, user_id, role, status)
  values (invitation.family_id, auth.uid(), invitation.role, 'active')
  on conflict (family_id, user_id) do nothing;

  update public.invitations
  set status = 'accepted', accepted_at = now(), updated_at = now()
  where id = invitation.id and status = 'pending';

  return invitation.family_id;
end;
$$;

create or replace function public.prevent_last_owner_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_count integer;
begin
  if (tg_op = 'DELETE' and old.role = 'owner')
    or (tg_op = 'UPDATE' and old.role = 'owner' and new.role <> 'owner') then
    perform 1 from public.families where id = old.family_id for update;
    select count(*) into owner_count
    from public.family_members
    where family_id = old.family_id
      and status = 'active'
      and role = 'owner'
      and user_id <> old.user_id;
    if owner_count = 0 then
      raise exception 'Family must keep at least one owner';
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_last_owner on public.family_members;
create trigger protect_last_owner
before update or delete on public.family_members
for each row execute function public.prevent_last_owner_change();
