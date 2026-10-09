import Link from "next/link";
import { brl } from "@/lib/format";
import { cardImage, type Card } from "@/lib/types";

const STATUS_LABEL = { available: "", reserved: "Reservada", sold: "Vendida" };

export default function CardItem({ card }: { card: Card }) {
  const unavailable = card.status !== "available" || card.quantity < 1;
  return (
    <Link
      href={`/cartas/${card.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition hover:ring-yellow-400"
    >
      <div className="relative aspect-[5/7] bg-black/30 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardImage(card)}
          alt={card.name}
          loading="lazy"
          className={`h-full w-full object-contain transition group-hover:scale-105 ${unavailable ? "opacity-40" : ""}`}
        />
        <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-bold">
          {card.condition}
        </span>
        {card.status !== "available" && (
          <span className="absolute right-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold">
            {STATUS_LABEL[card.status]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{card.name}</h3>
        <p className="text-xs text-white/60">
          {card.set_name} {card.number && `· ${card.number}`}
        </p>
        <p className="mt-auto pt-2 text-lg font-extrabold text-yellow-400">
          {brl(card.price)}
        </p>
      </div>
    </Link>
  );
}
