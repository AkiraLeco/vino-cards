import { createClient } from "@/lib/supabase/server";
import { csvCell } from "@/lib/validation";
import { CATEGORIES, CONDITIONS, GAMES, type Card } from "@/lib/types";

const cell = csvCell;

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Não autorizado", { status: 401 });

  const { data } = await supabase.from("cards").select("*").order("name");
  const cards = (data ?? []) as Card[];
  const head = ["Jogo", "Tipo", "Nome", "Coleção", "Número", "Raridade", "Estado", "Idioma", "Foil", "Preço", "Preço ref.", "Quantidade", "Status"];
  const rows = cards.map((c) =>
    [c.game ? GAMES[c.game] : "", CATEGORIES[c.category], c.name, c.set_name, c.number, c.rarity, CONDITIONS[c.condition], c.language, c.is_foil ? "Sim" : "Não", c.price.toFixed(2).replace(".", ","), c.ref_price?.toFixed(2).replace(".", ","), c.quantity, c.status].map(cell).join(";"),
  );
  // BOM para o Excel abrir acentos corretamente
  const csv = "﻿" + [head.map(cell).join(";"), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="cartas.csv"',
      "cache-control": "no-store",
    },
  });
}
