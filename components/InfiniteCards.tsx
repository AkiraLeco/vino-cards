"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadMoreCards } from "@/app/home-actions";
import CardItem from "@/components/CardItem";
import { HOME_PAGE_SIZE } from "@/lib/home";
import type { Card, Game } from "@/lib/types";

const arrow =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/85 text-2xl text-white shadow-lg backdrop-blur transition hover:bg-gold-deep disabled:pointer-events-none disabled:opacity-0 sm:grid";

/** Carrossel de cartas (setas e arrastar; não anda sozinho). Carrega mais cartas ao chegar perto do fim, sem limite. */
export default function InfiniteCards({ game, initial }: { game: Game; initial: Card[] }) {
  const [cards, setCards] = useState(initial);
  const [done, setDone] = useState(initial.length < HOME_PAGE_SIZE);
  const [edge, setEdge] = useState({ start: true, end: false });
  const scroller = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  const offset = useRef(initial.length);

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    const root = scroller.current;
    const el = sentinel.current;
    if (!root || !el || done) return;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loading.current) return;
        loading.current = true;
        const next = await loadMoreCards(game, offset.current);
        offset.current += next.length;
        setCards((c) => [...c, ...next.filter((n) => !c.some((x) => x.id === n.id))]);
        if (next.length < HOME_PAGE_SIZE) setDone(true);
        loading.current = false;
      },
      { root, rootMargin: "0px 800px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [game, done, cards.length]);

  useEffect(updateEdges, [cards.length, updateEdges]);

  const move = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="relative" role="region" aria-roledescription="carrossel" aria-label={`Cartas de ${game === "pokemon" ? "Pokémon" : "Riftbound"}`}>
      <button type="button" onClick={() => move(-1)} disabled={edge.start} aria-label="Cartas anteriores" className={`${arrow} -left-3`}>
        ‹
      </button>
      <div
        ref={scroller}
        onScroll={updateEdges}
        className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((c) => (
          <div key={c.id} className="flex w-[46%] shrink-0 snap-start [&>*]:w-full sm:w-[30%] lg:w-[23.5%] xl:w-[19%]">
            <CardItem card={c} />
          </div>
        ))}
        {!done && (
          <div ref={sentinel} className="grid w-24 shrink-0 place-items-center text-xs text-black/60" role="status">
            Carregando...
          </div>
        )}
      </div>
      <button type="button" onClick={() => move(1)} disabled={edge.end && done} aria-label="Próximas cartas" className={`${arrow} -right-3`}>
        ›
      </button>
    </div>
  );
}
