-- Opcional (uma vez): itens "disponíveis" com quantidade 0 passam a "vendidos".
update public.cards set status = 'sold' where quantity <= 0 and status = 'available';
