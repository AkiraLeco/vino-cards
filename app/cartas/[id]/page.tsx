import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import Gallery from "@/components/Gallery";
import { brl } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, CONDITIONS, GAMES, cardImage, type Card } from "@/lib/types";

export const dynamic = "force-dynamic";

// Prévia ao compartilhar o link (WhatsApp, Instagram etc.)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();
  if (!data) return {};
  const c = data as Card;
  const title = `${c.name} - ${brl(c.price)}`;
  const description = [
    c.set_name,
    c.category === "single" ? c.number : null,
    c.category === "single" ? CONDITIONS[c.condition] : null,
    c.category === "accessory" ? null : c.language,
  ]
    .filter(Boolean)
    .join(" · ");
  const image = cardImage(c);
  return {
    title,
    description,
    openGraph: { title, description, images: image.startsWith("http") ? [image] : [] },
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const card = data as Card;

  const single = card.category === "single";
  const rows: [string, string | null][] = [
    ["Jogo", card.game ? GAMES[card.game] : null],
    ["Tipo", CATEGORIES[card.category]],
    [single ? "Coleção" : "Coleção / linha", card.set_name],
    ["Número", single ? card.number : null],
    ["Raridade", single ? card.rarity : null],
    ["Estado", single ? CONDITIONS[card.condition] : null],
    ["Idioma", card.category === "accessory" ? null : card.language],
    ["Foil", single ? (card.is_foil ? "Sim" : "Não") : null],
    ["Em estoque", String(card.quantity)],
  ];

  const images = [...card.photo_urls, ...(card.image_api_url ? [card.image_api_url] : [])];
  if (images.length === 0) images.push(cardImage(card));
  const unavailable = card.status !== "available" || card.quantity < 1;
  const section = card.category === "accessory" ? "acessorios" : card.category === "sealed" ? "selados" : "cartas";
  const crumbs: [string, string][] = [["Início", "/"]];
  if (card.game) {
    crumbs.push([GAMES[card.game], `/${card.game}/cartas`]);
    crumbs.push([
      card.category === "sealed" ? "Produtos Selados" : "Cartas Avulsas",
      `/${card.game}/${section}`,
    ]);
  } else {
    crumbs.push(["Acessórios", "/acessorios"]);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-black/50" aria-label="Você está em">
        {crumbs.map(([label, href]) => (
          <span key={href} className="flex items-center gap-1.5">
            <Link href={href} className="hover:text-violet-700">
              {label}
            </Link>
            <span>›</span>
          </span>
        ))}
        <span className="font-medium text-black/70">{card.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <Gallery images={images} alt={card.name} />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
              {[card.game ? GAMES[card.game] : null, CATEGORIES[card.category]].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{card.name}</h1>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/50">Preço</p>
            <p className="text-4xl font-black tracking-tight text-violet-700">{brl(card.price)}</p>
            {card.ref_price != null && (
              <p className="mt-1 text-sm text-black/50">Referência de mercado: {brl(card.ref_price)}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {single && (
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                  {CONDITIONS[card.condition]}
                </span>
              )}
              {single && card.is_foil && (
                <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 px-3 py-1 text-xs font-bold text-white">
                  FOIL
                </span>
              )}
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
                {card.quantity} em estoque
              </span>
            </div>

            {card.status === "reserved" && (
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
                Este item está reservado para outro cliente.
              </p>
            )}
            {card.status === "sold" && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
                Este item já foi vendido.
              </p>
            )}
            <div className="mt-4">
              <AddToCart card={card} />
            </div>
            {unavailable && card.status === "available" && (
              <p className="mt-2 text-center text-xs text-black/50">Sem estoque no momento.</p>
            )}
          </div>

          <dl className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            {rows.map(([k, v]) =>
              v ? (
                <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-black/50">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>

          {card.notes && (
            <div className="rounded-2xl border border-black/5 bg-white p-4 text-sm leading-relaxed text-black/75 shadow-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-black/40">Observações</p>
              {card.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
