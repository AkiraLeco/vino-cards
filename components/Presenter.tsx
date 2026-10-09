"use client";

import { useEffect, useState } from "react";
import { brl } from "@/lib/format";
import { CONDITIONS, cardImage, type Card } from "@/lib/types";

export default function Presenter({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const n = cards.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  if (n === 0) return <p className="py-20 text-center text-white/60">Sem cartas disponíveis.</p>;
  const c = cards[i];

  return (
    <div
      className="flex flex-col items-center gap-4"
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX == null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        setTouchX(null);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cardImage(c)} alt={c.name} className="max-h-[65vh] object-contain" />
      <h1 className="text-center text-2xl font-extrabold">{c.name}</h1>
      <p className="text-5xl font-extrabold text-yellow-400">{brl(c.price)}</p>
      <p className="text-center text-white/70">
        {CONDITIONS[c.condition]} · {c.language} · {c.set_name} {c.number}
        {c.is_foil && " · Foil"}
      </p>
      <div className="flex items-center gap-6">
        <button onClick={() => go(-1)} className="rounded-full bg-white/10 px-6 py-3 text-xl">
          ←
        </button>
        <span className="text-sm text-white/60">
          {i + 1} / {n}
        </span>
        <button onClick={() => go(1)} className="rounded-full bg-white/10 px-6 py-3 text-xl">
          →
        </button>
      </div>
    </div>
  );
}
