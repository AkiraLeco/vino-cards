import Link from "next/link";
import { brl } from "@/lib/format";
import { cardImage, type Card } from "@/lib/types";

const STATUS_LABEL = { available: "", reserved: "RESERVADA", sold: "VENDIDA" };

export default function CardItem({ card }: { card: Card }) {
  const unavailable = card.status !== "available" || card.quantity < 1;
  return (
    <Link
      href={`/cartas/${card.id}`}
      className="group flex flex-col rounded-md bg-white p-2 sm:p-3 shadow-[0_1px_6px_rgba(0,0,0,0.12)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
    >
      <div className="relative aspect-[5/7]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardImage(card)}
          alt={card.name}
          loading="lazy"
          className={`h-full w-full rounded-sm object-contain ${unavailable ? "opacity-40" : ""}`}
        />
        {card.is_foil && (
          <span className="absolute left-0 top-[48%] bg-red-400/90 px-2 py-1 text-xs font-semibold uppercase text-white">
            Foil
          </span>
        )}
        {card.status !== "available" && (
          <span className="absolute right-1 top-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            {STATUS_LABEL[card.status]}
          </span>
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 min-h-[2.25rem] text-sm leading-tight sm:mt-3 sm:min-h-[2.5rem] sm:text-lg">
        {card.name}
        {card.number && <span className="text-black/60"> (#{card.number})</span>}
      </h3>
      <p className="line-clamp-1 text-[11px] text-black/50 sm:text-xs">
        {card.set_name} · {card.condition} · {card.language}
      </p>
      <div className="mt-2 flex items-baseline justify-between gap-1">
        <span className="text-xs sm:text-sm">{card.quantity} un.</span>
        <span className="font-mono text-base font-bold sm:text-lg">{brl(card.price)}</span>
      </div>
    </Link>
  );
}
