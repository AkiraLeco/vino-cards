-- Rode no SQL Editor do Supabase (uma vez), DEPOIS de marcar seu usuário como admin (passo 1).

-- 1) Marque o usuário do cliente como admin (troque o e-mail):
--    update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--    where email = 'EMAIL_DO_ADMIN@exemplo.com';
--    Depois saia e entre de novo no /admin para o login receber o papel.

-- 2) Só admin escreve (antes: qualquer usuário logado).
drop policy if exists "admin escreve" on public.cards;
create policy "admin escreve" on public.cards
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "fotos admin envia" on storage.objects;
create policy "fotos admin envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'card-photos' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "fotos admin apaga" on storage.objects;
create policy "fotos admin apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'card-photos' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Limita tamanho e tipo das fotos no bucket (5 MB, só imagens).
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'card-photos';

-- 3) Restrições de dados.
update public.cards set quantity = 0 where quantity < 0;
alter table public.cards
  drop constraint if exists cards_price_check,
  drop constraint if exists cards_quantity_check,
  drop constraint if exists cards_ref_price_check;
alter table public.cards
  add constraint cards_price_check check (price >= 0),
  add constraint cards_quantity_check check (quantity >= 0),
  add constraint cards_ref_price_check check (ref_price is null or ref_price >= 0);

-- 4) updated_at automático.
alter table public.cards add column if not exists updated_at timestamptz not null default now();
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists cards_touch on public.cards;
create trigger cards_touch before update on public.cards
  for each row execute function public.touch_updated_at();

-- 5) Índices das consultas do catálogo.
create index if not exists cards_status_idx on public.cards (status);
create index if not exists cards_game_category_idx on public.cards (game, category);
create index if not exists cards_featured_idx on public.cards (featured) where featured;
create index if not exists cards_created_at_idx on public.cards (created_at desc);
