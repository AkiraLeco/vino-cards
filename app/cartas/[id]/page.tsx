import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import { brl } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { CONDITIONS, cardImage, type Card } from "@/lib/types";

export const dynamic = "force-dynamic";

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

  const rows: [string, string | null][] = [
    ["Coleção", card.set_name],
    ["Número", card.number],
    ["Raridade", card.rarity],
    ["Estado", CONDITIONS[card.condition]],
    ["Idioma", card.language],
    ["Foil", card.is_foil ? "Sim" : "Não"],
    ["Em estoque", String(card.quantity)],
  ];

  return (
    <div>
      <Link href="/" className="text-sm text-white/60 hover:text-white">
        ← Voltar
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardImage(card)}
            alt={card.name}
            className="mx-auto max-h-[75vh] rounded-xl object-contain"
          />
          {card.photo_urls.length > 0 && card.image_api_url && (
            <div className="flex justify-center gap-2">
              {[...card.photo_urls, card.image_api_url].map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={u} alt="" className="h-20 rounded bg-white/5 object-contain" />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold">{card.name}</h1>
          <p className="text-4xl font-extrabold text-yellow-400">{brl(card.price)}</p>
          {card.ref_price != null && (
            <p className="text-sm text-white/60">
              Preço de referência: {brl(card.ref_price)}
            </p>
          )}
          <dl className="divide-y divide-white/10 rounded-xl bg-white/5 ring-1 ring-white/10">
            {rows.map(([k, v]) =>
              v ? (
                <div key={k} className="flex justify-between px-4 py-2 text-sm">
                  <dt className="text-white/60">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>
          {card.notes && <p className="text-sm text-white/80">{card.notes}</p>}
          <AddToCart card={card} />
        </div>
      </div>
    </div>
  );
}
