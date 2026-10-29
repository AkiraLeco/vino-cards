import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import Gallery from "@/components/Gallery";
import { brl } from "@/lib/format";
import CardItem from "@/components/CardItem";
import { createPublicClient } from "@/lib/supabase/public";
import { siteUrl } from "@/lib/site";
import { CATEGORIES, CONDITIONS, GAMES, cardImage, type Card } from "@/lib/types";

// Dados públicos: página em cache, renovada a cada 60 s (o admin também a renova ao salvar).
export const revalidate = 60;

// Prévia ao compartilhar o link (WhatsApp, Instagram etc.)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createPublicClient();
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
  const supabase = createPublicClient();
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

  let relatedQuery = supabase
    .from("cards")
    .select("*")
    .neq("id", card.id)
    .eq("category", card.category)
    .in("status", ["available", "reserved"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);
  if (card.set_name) relatedQuery = relatedQuery.eq("set_name", card.set_name);
  else if (card.game) relatedQuery = relatedQuery.eq("game", card.game);
  const { data: relatedData } = await relatedQuery;
  const related = (relatedData ?? []) as Card[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: card.name,
    image: cardImage(card).startsWith("http") ? cardImage(card) : undefined,
    description: [card.set_name, single ? CONDITIONS[card.condition] : null].filter(Boolean).join(" · ") || card.name,
    offers: {
      "@type": "Offer",
      url: `${siteUrl()}/cartas/${card.id}`,
      priceCurrency: "BRL",
      price: card.price,
      availability:
        card.status === "available" && card.quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

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
    <div className="mx-auto max-w-6xl pb-24 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-black/50" aria-label="Você está em">
        {crumbs.map(([label, href]) => (
          <span key={href} className="flex items-center gap-1.5">
            <Link href={href} className="hover:text-gold-deep">
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
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-deep">
              {[card.game ? GAMES[card.game] : null, CATEGORIES[card.category]].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-1 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{card.name}</h1>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-white p-5 shadow-lg shadow-ink/5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">Preço</p>
            <p className="font-display text-5xl font-bold tracking-tight text-ink">{brl(card.price)}</p>
            {card.ref_price != null && (
              <p className="mt-1 text-sm text-black/50">Referência de mercado: {brl(card.ref_price)}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {single && (
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-gold-deep ring-1 ring-gold/30">
                  {CONDITIONS[card.condition]}
                </span>
              )}
              {single && card.is_foil && (
                <span className="rounded-full bg-gradient-to-r from-gold-deep to-gold-soft px-3 py-1 text-xs font-bold text-white">
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
      {related.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 border-b border-gold/30 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">Continue explorando</p>
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {card.set_name ? `Mais de ${card.set_name}` : "Itens parecidos"}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {related.map((c) => (
              <CardItem key={c.id} card={c} />
            ))}
          </div>
        </section>
      )}

      {!unavailable && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gold/30 bg-white/95 px-4 py-3 pr-20 shadow-[0_-8px_24px_-12px_rgba(20,18,42,0.3)] backdrop-blur md:hidden print:hidden">
          <span className="font-display text-2xl font-bold text-ink">{brl(card.price)}</span>
          <div className="min-w-0 flex-1">
            <AddToCart card={card} />
          </div>
        </div>
      )}
    </div>
  );
}
