-- Avoid a circular RLS dependency between partnerships and partnership_members.
-- The member-level visibility policy still filters restricted people.
drop policy if exists partnerships_select_visible on public.partnerships;
create policy partnerships_select_visible on public.partnerships
for select using (public.is_family_member(family_id));
