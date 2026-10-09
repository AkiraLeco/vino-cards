import Link from "next/link";
import CardItem from "@/components/CardItem";
import { STORE_NAME } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

const TILES = [
  { href: "/pokemon/cartas", title: "Pokémon", sub: "Cartas, selados e coleções", color: "from-yellow-400 to-red-500" },
  { href: "/riftbound/cartas", title: "Riftbound", sub: "Cartas, selados e coleções", color: "from-sky-500 to-violet-700" },
  { href: "/acessorios", title: "Acessórios", sub: "Playmats, sleeves, deckboxes", color: "from-emerald-500 to-teal-700" },
];

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cards")
    .select("*")
    .in("status", ["available", "reserved"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);
  const cards = (data ?? []) as Card[];

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="mb-4 text-2xl font-extrabold sm:text-3xl">Bem-vindo à {STORE_NAME}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-xl bg-gradient-to-br ${t.color} p-6 text-white shadow transition hover:scale-[1.02] hover:shadow-lg`}
          >
            <h2 className="text-2xl font-extrabold">{t.title}</h2>
            <p className="mt-1 text-sm text-white/90">{t.sub}</p>
          </Link>
        ))}
      </div>

      {cards.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xl font-extrabold">Novidades</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards.map((c) => (
              <CardItem key={c.id} card={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
