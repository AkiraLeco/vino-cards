import Link from "next/link";
import CardImage from "./CardImage";
import { brl } from "@/lib/format";
import { GAMES, cardImage, type Card } from "@/lib/types";

export default function CardItem({ card }: { card: Card }) {
  const single = card.category === "single";
  const sold = card.status === "sold";
  const reserved = card.status === "reserved";
  const outOfStock = !sold && !reserved && card.quantity < 1;
  const dim = sold || outOfStock ? "opacity-40 grayscale-[30%]" : reserved ? "opacity-75" : "";

  const kicker = [card.game ? GAMES[card.game] : null, card.set_name].filter(Boolean).join(" · ");
  const badge = sold
    ? ["VENDIDA", "bg-red-600"]
    : reserved
      ? ["RESERVADA", "bg-amber-500"]
      : outOfStock
        ? ["SEM ESTOQUE", "bg-slate-600"]
        : null;

  return (
    <Link
      href={`/cartas/${card.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/10"
    >
      <div className="relative bg-gradient-to-b from-violet-50 to-white p-3 sm:p-4">
        <div className="relative aspect-[5/7]">
          <CardImage
            src={cardImage(card)}
            alt={card.name}
            sizes="(min-width:1280px) 260px, (min-width:1024px) 22vw, (min-width:640px) 30vw, 46vw"
            className={`rounded-md object-contain drop-shadow-md transition duration-300 group-hover:scale-[1.03] ${dim}`}
          />
        </div>
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {single && (
            <span className="rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm ring-1 ring-black/5">
              {card.condition}
            </span>
          )}
          {single && card.is_foil && (
            <span className="rounded-md bg-gradient-to-r from-fuchsia-500 to-amber-400 px-1.5 py-0.5 text-[11px] font-bold uppercase text-white shadow-sm">
              Foil
            </span>
          )}
        </div>
        {badge && (
          <span className={`absolute right-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow ${badge[1]}`}>
            {badge[0]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
        {kicker && (
          <p className="line-clamp-1 text-[10px] font-semibold uppercase tracking-wider text-violet-600 sm:text-[11px]">
            {kicker}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug sm:text-base">
          {card.name}
          {single && card.number && <span className="font-normal text-black/45"> #{card.number}</span>}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="text-lg font-extrabold tracking-tight text-violet-700 sm:text-xl">{brl(card.price)}</span>
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium text-black/60 sm:text-xs">
            {card.quantity} un.
          </span>
        </div>
      </div>
    </Link>
  );
}
