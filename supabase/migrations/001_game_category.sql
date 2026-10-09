-- Rode no SQL Editor do Supabase (uma vez). É seguro: só adiciona colunas.
-- Cartas já cadastradas viram "Pokémon" + "Carta avulsa".

alter table public.cards
  add column if not exists game text default 'pokemon'
    check (game is null or game in ('pokemon', 'riftbound'));

alter table public.cards
  add column if not exists category text not null default 'single'
    check (category in ('single', 'sealed', 'accessory'));

update public.cards set game = 'pokemon' where game is null and category <> 'accessory';
