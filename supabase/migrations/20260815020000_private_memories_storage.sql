alter table public.memories
  add column photo_id uuid references public.photos(id) on delete set null;

create index memories_family_photo_idx on public.memories (family_id, photo_id);

insert into storage.buckets (id, name, public)
values ('family-private', 'family-private', false)
on conflict (id) do update set public = false;

create policy family_private_select_member on storage.objects
for select using (
  bucket_id = 'family-private'
  and public.is_family_member((storage.foldername(name))[1]::uuid)
);

create policy family_private_insert_editor on storage.objects
for insert with check (
  bucket_id = 'family-private'
  and public.has_family_role((storage.foldername(name))[1]::uuid, array['owner', 'admin', 'editor']::public.family_member_role[])
);

create policy family_private_update_editor on storage.objects
for update using (
  bucket_id = 'family-private'
  and public.has_family_role((storage.foldername(name))[1]::uuid, array['owner', 'admin', 'editor']::public.family_member_role[])
)
with check (
  bucket_id = 'family-private'
  and public.has_family_role((storage.foldername(name))[1]::uuid, array['owner', 'admin', 'editor']::public.family_member_role[])
);

create policy family_private_delete_editor on storage.objects
for delete using (
  bucket_id = 'family-private'
  and public.has_family_role((storage.foldername(name))[1]::uuid, array['owner', 'admin', 'editor']::public.family_member_role[])
);
