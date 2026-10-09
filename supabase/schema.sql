-- Rode este arquivo no SQL Editor do Supabase.

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  api_card_id text,
  name text not null,
  set_name text,
  number text,
  rarity text,
  language text not null default 'Português',
  condition text not null default 'NM' check (condition in ('M','NM','SP','MP','HP','D')),
  is_foil boolean not null default false,
  price numeric(10,2) not null default 0,
  ref_price numeric(10,2),
  quantity int not null default 1,
  status text not null default 'available' check (status in ('available','reserved','sold')),
  image_api_url text,
  photo_urls text[] not null default '{}',
  notes text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

create policy "leitura publica" on public.cards
  for select using (true);

create policy "admin escreve" on public.cards
  for all to authenticated using (true) with check (true);

-- Bucket para fotos reais das cartas
insert into storage.buckets (id, name, public)
values ('card-photos', 'card-photos', true)
on conflict (id) do nothing;

create policy "fotos leitura publica" on storage.objects
  for select using (bucket_id = 'card-photos');

create policy "fotos admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'card-photos');

create policy "fotos admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'card-photos');

-- Crie o usuário do cliente em Authentication > Users (email + senha).
-- Em Authentication > Providers, desative "Allow new users to sign up".
