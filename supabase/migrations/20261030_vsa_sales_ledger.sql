-- VIRAL SALES AI: sales ledger for manual records and future payment webhooks.
create table if not exists public.vsa_sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.vsa_products(id) on delete set null,
  campaign_id uuid references public.vsa_campaigns(id) on delete set null,
  lead_id uuid references public.vsa_leads(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'BRL',
  status text not null default 'confirmed' check (status in ('pending','confirmed','refunded','cancelled')),
  source text,
  external_reference text,
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists vsa_sales_user_sold_idx on public.vsa_sales(user_id,sold_at desc);
alter table public.vsa_sales enable row level security;
create policy "vsa_sales_select_own" on public.vsa_sales for select to authenticated using ((select auth.uid()) = user_id);
create policy "vsa_sales_insert_own" on public.vsa_sales for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vsa_sales_update_own" on public.vsa_sales for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vsa_sales_delete_own" on public.vsa_sales for delete to authenticated using ((select auth.uid()) = user_id);
grant select,insert,update,delete on public.vsa_sales to authenticated;