import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GAMES, cardImage, isGame } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Colecoes({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!isGame(game)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("set_name, image_api_url, photo_urls")
    .eq("game", game)
    .eq("category", "single")
    .in("status", ["available", "reserved"])
    .not("set_name", "is", null)
    .limit(5000);

  const sets = new Map<string, { count: number; image: string }>();
  for (const c of data ?? []) {
    const name = c.set_name as string;
    const cur = sets.get(name);
    if (cur) cur.count += 1;
    else sets.set(name, { count: 1, image: cardImage(c) });
  }
  const list = [...sets.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="mb-4 text-2xl font-extrabold">{GAMES[game]} · Coleções</h1>
      {error && (
        <p className="rounded-lg bg-red-100 p-3 text-sm text-red-800">
          Erro ao carregar as coleções. Confirme que o SQL de migração foi executado no Supabase.
        </p>
      )}
      {list.length === 0 && !error && (
        <p className="py-10 text-center text-black/60">Nenhuma coleção disponível ainda.</p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map(([name, info]) => (
          <Link
            key={name}
            href={`/${game}/cartas?set=${encodeURIComponent(name)}`}
            className="group flex flex-col rounded-md bg-white p-2 shadow-[0_1px_6px_rgba(0,0,0,0.12)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] sm:p-3"
          >
            <div className="aspect-[5/7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={info.image} alt={name} loading="lazy" className="h-full w-full object-contain" />
            </div>
            <h2 className="mt-2 line-clamp-2 text-sm font-semibold leading-tight sm:text-lg">{name}</h2>
            <p className="text-xs text-black/60 sm:text-sm">
              {info.count} {info.count === 1 ? "carta" : "cartas"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
