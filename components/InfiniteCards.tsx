"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadMoreCards } from "@/app/home-actions";
import CardItem from "@/components/CardItem";
import { HOME_PAGE_SIZE } from "@/lib/home";
import type { Card, Game } from "@/lib/types";

const arrow =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/85 text-2xl text-white shadow-lg backdrop-blur transition hover:bg-gold-deep disabled:pointer-events-none disabled:opacity-0 sm:grid";

/**
 * Carrossel de cartas (setas e arrastar; não anda sozinho). Carrega mais cartas ao chegar perto do fim.
 * Quando todas já foram carregadas, a lista se repete e o carrossel gira sem fim.
 */
export default function InfiniteCards({ game, initial }: { game: Game; initial: Card[] }) {
  const [cards, setCards] = useState(initial);
  const [done, setDone] = useState(initial.length < HOME_PAGE_SIZE);
  const [edge, setEdge] = useState({ start: true, end: false });
  const scroller = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  const offset = useRef(initial.length);

  const loop = done;

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    if (loop && cards.length > 0) {
      // Três cópias lado a lado: ao sair da cópia do meio, volta uma cópia (mesmo conteúdo, a troca não aparece).
      const n = cards.length;
      const first = el.children[0] as HTMLElement | undefined;
      const second = el.children[n] as HTMLElement | undefined;
      const S = first && second ? second.offsetLeft - first.offsetLeft : 0;
      if (S > 0 && (el.scrollLeft >= 2 * S || el.scrollLeft < S)) {
        const target = el.scrollLeft >= 2 * S ? el.scrollLeft - S : el.scrollLeft + S;
        el.style.scrollSnapType = "none";
        el.scrollTo({ left: target, behavior: "instant" });
        requestAnimationFrame(() => {
          el.style.scrollSnapType = "";
        });
      }
    }
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, [loop, cards.length]);

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

  useEffect(() => {
    updateEdges();
  }, [updateEdges]);

  const move = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="relative" role="region" aria-roledescription="carrossel" aria-label={`Cartas de ${game === "pokemon" ? "Pokémon" : "Riftbound"}`}>
      <button type="button" onClick={() => move(-1)} disabled={edge.start && !loop} aria-label="Cartas anteriores" className={`${arrow} -left-3`}>
        ‹
      </button>
      <div
        ref={scroller}
        onScroll={updateEdges}
        className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {(loop ? [...cards, ...cards, ...cards] : cards).map((c, i) => (
          <div key={`${i}-${c.id}`} className="flex w-[46%] shrink-0 snap-start [&>*]:w-full sm:w-[30%] lg:w-[23.5%] xl:w-[19%]">
            <CardItem card={c} />
          </div>
        ))}
        {!done && (
          <div ref={sentinel} className="grid w-24 shrink-0 place-items-center text-xs text-black/60" role="status">
            Carregando...
          </div>
        )}
      </div>
      <button type="button" onClick={() => move(1)} disabled={edge.end && !loop} aria-label="Próximas cartas" className={`${arrow} -right-3`}>
        ›
      </button>
    </div>
  );
}
