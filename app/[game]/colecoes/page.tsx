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
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{GAMES[game]} · Coleções</h1>
      <p className="mb-5 text-sm text-black/55">Escolha uma coleção para ver as cartas.</p>
      {error && (
        <p className="rounded-lg bg-red-100 p-3 text-sm text-red-800">
          Erro ao carregar as coleções. Confirme que o SQL de migração foi executado no Supabase.
        </p>
      )}
      {list.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white px-6 py-14 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-2 font-semibold">Nenhuma coleção disponível ainda</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {list.map(([name, info]) => (
          <Link
            key={name}
            href={`/${game}/cartas?set=${encodeURIComponent(name)}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/10"
          >
            <div className="bg-gradient-to-b from-violet-50 to-white p-4">
              <div className="aspect-[5/7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={info.image} alt={name} loading="lazy" className="h-full w-full object-contain drop-shadow-md transition duration-300 group-hover:scale-[1.03]" />
              </div>
            </div>
            <div className="px-4 pb-4 pt-2">
              <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug sm:text-base">{name}</h2>
              <p className="mt-1 text-xs font-medium text-violet-700 sm:text-sm">
                {info.count} {info.count === 1 ? "carta" : "cartas"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
