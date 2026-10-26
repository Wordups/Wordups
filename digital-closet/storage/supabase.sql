-- Apply to a dedicated Supabase project. No existing inventory is imported.
begin;
create table public.dc_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (id ~ '^[A-Z]{3}-[0-9]{3,}$'),
  record jsonb not null check (jsonb_typeof(record) = 'object' and record ? 'id' and record->>'id' = id),
  primary key (user_id, id)
);
create table public.dc_outfits (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  record jsonb not null check (jsonb_typeof(record) = 'object' and record ? 'id' and record->>'id' = id),
  primary key (user_id, id)
);
alter table public.dc_items enable row level security;
alter table public.dc_outfits enable row level security;
revoke all on public.dc_items, public.dc_outfits from anon;
grant select, insert, update, delete on public.dc_items, public.dc_outfits to authenticated;
create policy "Own closet items" on public.dc_items for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own closet outfits" on public.dc_outfits for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('closet-photos', 'closet-photos', false, 10485760, array['image/jpeg','image/png','image/webp']);
create policy "Read own closet photos" on storage.objects for select to authenticated
  using (bucket_id = 'closet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Upload own closet photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'closet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Delete own closet photos" on storage.objects for delete to authenticated
  using (bucket_id = 'closet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
commit;
