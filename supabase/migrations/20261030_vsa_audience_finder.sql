create table if not exists public.vsa_audience_opportunities (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 product_id uuid references public.vsa_products(id) on delete set null,
 niche text not null,
 audience text not null,
 platform text not null,
 source_url text,
 signal text not null,
 notes text,
 status text not null default 'saved' check (status in ('saved','reviewing','contacted','converted','dismissed')),
 created_at timestamptz not null default now()
);
create index if not exists vsa_audience_opportunities_user_created_idx on public.vsa_audience_opportunities(user_id,created_at desc);
alter table public.vsa_audience_opportunities enable row level security;
drop policy if exists "Users can view own audience opportunities" on public.vsa_audience_opportunities;
create policy "Users can view own audience opportunities" on public.vsa_audience_opportunities for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Users can insert own audience opportunities" on public.vsa_audience_opportunities;
create policy "Users can insert own audience opportunities" on public.vsa_audience_opportunities for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Users can update own audience opportunities" on public.vsa_audience_opportunities;
create policy "Users can update own audience opportunities" on public.vsa_audience_opportunities for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "Users can delete own audience opportunities" on public.vsa_audience_opportunities;
create policy "Users can delete own audience opportunities" on public.vsa_audience_opportunities for delete to authenticated using ((select auth.uid())=user_id);
grant select,insert,update,delete on public.vsa_audience_opportunities to authenticated;
