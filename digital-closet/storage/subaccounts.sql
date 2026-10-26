-- Add shared-closet subaccounts without changing personal closet ownership.
begin;
create table public.dc_subaccounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  master_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_id <> master_user_id)
);
create index dc_subaccounts_master_idx on public.dc_subaccounts(master_user_id);
alter table public.dc_subaccounts enable row level security;
revoke all on public.dc_subaccounts from anon, authenticated;
grant select on public.dc_subaccounts to authenticated;
create policy "See own closet linkage" on public.dc_subaccounts for select to authenticated
  using (user_id = (select auth.uid()) or master_user_id = (select auth.uid()));
-- Linkages are provisioned by the owner through the trusted backend, not by clients.
create policy "Linked closet items" on public.dc_items for all to authenticated
  using (user_id in (select master_user_id from public.dc_subaccounts where user_id = (select auth.uid())))
  with check (user_id in (select master_user_id from public.dc_subaccounts where user_id = (select auth.uid())));
create policy "Linked closet outfits" on public.dc_outfits for all to authenticated
  using (user_id in (select master_user_id from public.dc_subaccounts where user_id = (select auth.uid())))
  with check (user_id in (select master_user_id from public.dc_subaccounts where user_id = (select auth.uid())));
create policy "Read linked closet photos" on storage.objects for select to authenticated
  using (bucket_id = 'closet-photos' and (storage.foldername(name))[1] in (select master_user_id::text from public.dc_subaccounts where user_id = (select auth.uid())));
create policy "Upload linked closet photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'closet-photos' and (storage.foldername(name))[1] in (select master_user_id::text from public.dc_subaccounts where user_id = (select auth.uid())));
create policy "Delete linked closet photos" on storage.objects for delete to authenticated
  using (bucket_id = 'closet-photos' and (storage.foldername(name))[1] in (select master_user_id::text from public.dc_subaccounts where user_id = (select auth.uid())));
commit;
