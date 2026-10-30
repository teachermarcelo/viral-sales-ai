-- VIRAL SALES AI: AI Creative Studio history.
create table if not exists public.vsa_creatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.vsa_products(id) on delete set null,
  channel text not null,
  audience text not null,
  pain_point text not null,
  offer text,
  hook text not null,
  caption text not null,
  cta text not null,
  creative_brief text not null,
  created_at timestamptz not null default now()
);
create index if not exists vsa_creatives_user_created_idx on public.vsa_creatives(user_id, created_at desc);
alter table public.vsa_creatives enable row level security;
create policy "vsa_creatives_select_own" on public.vsa_creatives for select to authenticated using ((select auth.uid()) = user_id);
create policy "vsa_creatives_insert_own" on public.vsa_creatives for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vsa_creatives_delete_own" on public.vsa_creatives for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, delete on public.vsa_creatives to authenticated;
