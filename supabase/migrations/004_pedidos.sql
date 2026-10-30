-- Rode no SQL Editor do Supabase (uma vez), DEPOIS da 003 (usa o papel "admin" definido lá).
-- Pedidos com reserva de estoque: o estoque baixa ao criar o pedido e volta se for cancelado ou expirar (48 h).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity,
  customer_name text not null,
  customer_phone text not null,
  note text,
  total numeric(10,2) not null default 0,
  status text not null default 'received' check (status in ('received','paid','delivered','cancelled')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '48 hours'
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  card_id uuid references public.cards(id) on delete set null,
  name text not null,
  condition text,
  price numeric(10,2) not null,
  qty int not null check (qty > 0)
);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Visitantes não leem nem escrevem direto: só o admin. Criar pedido é feito pela função create_order.
drop policy if exists "admin pedidos" on public.orders;
create policy "admin pedidos" on public.orders for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "admin itens de pedido" on public.order_items;
create policy "admin itens de pedido" on public.order_items for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Cria o pedido e reserva o estoque numa única operação. Preço e estoque vêm do banco, nunca do navegador.
create or replace function public.create_order(p_name text, p_phone text, p_note text, p_items jsonb)
returns table (order_number bigint, order_total numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_order uuid;
  v_number bigint;
  v_total numeric := 0;
  v_item jsonb;
  v_card public.cards%rowtype;
  v_qty int;
begin
  if coalesce(length(trim(p_name)), 0) < 2 or length(p_name) > 100 then raise exception 'NOME_INVALIDO'; end if;
  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) not between 10 and 13 then raise exception 'TELEFONE_INVALIDO'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'ITENS_INVALIDOS'; end if;

  insert into orders (customer_name, customer_phone, note)
  values (trim(p_name), trim(p_phone), nullif(left(trim(coalesce(p_note, '')), 500), ''))
  returning id, number into v_order, v_number;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'qty')::int;
    if v_qty is null or v_qty not between 1 and 50 then raise exception 'ITENS_INVALIDOS'; end if;

    -- Baixa condicional: só se ainda houver estoque (a linha fica travada até o fim da transação).
    update cards
       set quantity = quantity - v_qty,
           status = case when quantity - v_qty <= 0 then 'reserved' else status end
     where id = (v_item ->> 'id')::uuid and status = 'available' and quantity >= v_qty
     returning * into v_card;
    if not found then raise exception 'SEM_ESTOQUE'; end if;

    insert into order_items (order_id, card_id, name, condition, price, qty)
    values (v_order, v_card.id, v_card.name, v_card.condition, v_card.price, v_qty);
    v_total := v_total + v_card.price * v_qty;
  end loop;

  update orders set total = v_total where id = v_order;
  return query select v_number, v_total;
end $$;

-- Devolve ao estoque os itens de um pedido que foi cancelado ou expirou.
create or replace function public.release_order_stock(p_order uuid) returns void
language sql security definer set search_path = public as $$
  update cards c
     set quantity = c.quantity + i.qty,
         status = case when c.status in ('reserved', 'sold') then 'available' else c.status end
    from order_items i
   where i.order_id = p_order and i.card_id = c.id;
$$;
revoke all on function public.release_order_stock(uuid) from public, anon, authenticated;

-- Admin muda o estado do pedido; cancelar devolve o estoque.
create or replace function public.set_order_status(p_id uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare v_old text;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then raise exception 'NAO_AUTORIZADO'; end if;
  if p_status not in ('received','paid','delivered','cancelled') then raise exception 'STATUS_INVALIDO'; end if;
  select status into v_old from orders where id = p_id for update;
  if v_old is null then raise exception 'NAO_ENCONTRADO'; end if;
  if v_old = 'cancelled' then raise exception 'PEDIDO_CANCELADO'; end if;
  if p_status = 'cancelled' then perform release_order_stock(p_id); end if;
  update orders set status = p_status where id = p_id;
end $$;

-- Cancela pedidos "recebidos" vencidos e devolve o estoque. Chamada diária pelo /api/keepalive.
create or replace function public.expire_orders() returns int
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_n int := 0;
begin
  for v_id in select id from orders where status = 'received' and expires_at < now() for update skip locked loop
    perform release_order_stock(v_id);
    update orders set status = 'cancelled' where id = v_id;
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;

revoke all on function public.create_order(text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, jsonb) to anon, authenticated;
revoke all on function public.set_order_status(uuid, text) from public, anon;
grant execute on function public.set_order_status(uuid, text) to authenticated;
revoke all on function public.expire_orders() from public;
grant execute on function public.expire_orders() to anon, authenticated;
