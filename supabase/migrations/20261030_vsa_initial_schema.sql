-- VIRAL SALES AI · isolated table namespace
-- Apply only to the Supabase project selected for this app.
create extension if not exists pgcrypto;

create table if not exists public.vsa_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 180),
  niche text not null default 'Geral',
  price numeric(12,2) not null default 0 check (price >= 0),
  destination_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vsa_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.vsa_products(id) on delete set null,
  name text not null check (char_length(name) between 1 and 180),
  channel text not null default 'Outro',
  objective text not null default 'Tráfego',
  status text not null default 'Planejada',
  start_date date,
  end_date date,
  budget numeric(12,2) not null default 0 check (budget >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.vsa_tracking_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.vsa_products(id) on delete cascade,
  campaign_id uuid references public.vsa_campaigns(id) on delete set null,
  code text not null unique,
  destination_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.vsa_tracking_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tracking_link_id uuid references public.vsa_tracking_links(id) on delete set null,
  event_type text not null check (event_type in ('page_view','click','lead','checkout','sale')),
  source text,
  medium text,
  campaign text,
  referrer_host text,
  device_type text,
  country_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.vsa_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.vsa_campaigns(id) on delete set null,
  name text,
  email text,
  whatsapp text,
  consent_at timestamptz,
  status text not null default 'Novo',
  created_at timestamptz not null default now()
);

create index if not exists vsa_products_user_id_idx on public.vsa_products(user_id);
create index if not exists vsa_campaigns_user_id_idx on public.vsa_campaigns(user_id);
create index if not exists vsa_tracking_links_user_id_idx on public.vsa_tracking_links(user_id);
create index if not exists vsa_tracking_events_user_created_idx on public.vsa_tracking_events(user_id,created_at desc);
create index if not exists vsa_leads_user_created_idx on public.vsa_leads(user_id,created_at desc);

alter table public.vsa_products enable row level security;
alter table public.vsa_campaigns enable row level security;
alter table public.vsa_tracking_links enable row level security;
alter table public.vsa_tracking_events enable row level security;
alter table public.vsa_leads enable row level security;

create policy "vsa_products_select_own" on public.vsa_products for select to authenticated using ((select auth.uid()) = user_id);
create policy "vsa_products_insert_own" on public.vsa_products for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vsa_products_update_own" on public.vsa_products for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vsa_products_delete_own" on public.vsa_products for delete to authenticated using ((select auth.uid()) = user_id);

create policy "vsa_campaigns_select_own" on public.vsa_campaigns for select to authenticated using ((select auth.uid()) = user_id);
create policy "vsa_campaigns_insert_own" on public.vsa_campaigns for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vsa_campaigns_update_own" on public.vsa_campaigns for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vsa_campaigns_delete_own" on public.vsa_campaigns for delete to authenticated using ((select auth.uid()) = user_id);

create policy "vsa_links_select_own" on public.vsa_tracking_links for select to authenticated using ((select auth.uid()) = user_id);
create policy "vsa_links_insert_own" on public.vsa_tracking_links for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vsa_links_update_own" on public.vsa_tracking_links for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vsa_links_delete_own" on public.vsa_tracking_links for delete to authenticated using ((select auth.uid()) = user_id);

create policy "vsa_events_select_own" on public.vsa_tracking_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "vsa_events_insert_own" on public.vsa_tracking_events for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "vsa_leads_select_own" on public.vsa_leads for select to authenticated using ((select auth.uid()) = user_id);
create policy "vsa_leads_insert_own" on public.vsa_leads for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vsa_leads_update_own" on public.vsa_leads for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vsa_leads_delete_own" on public.vsa_leads for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.vsa_products, public.vsa_campaigns, public.vsa_tracking_links, public.vsa_leads to authenticated;
grant select, insert on public.vsa_tracking_events to authenticated;
