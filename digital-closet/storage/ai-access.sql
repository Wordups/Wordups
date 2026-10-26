begin;
create table public.dc_ai_access(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.dc_ai_access enable row level security;
revoke all on public.dc_ai_access from anon, authenticated;
grant select on public.dc_ai_access to authenticated;
create policy "Authorized closet analysis" on public.dc_ai_access for select to authenticated
  using (user_id=(select auth.uid()) or user_id in (select master_user_id from public.dc_subaccounts where user_id=(select auth.uid())));
commit;
