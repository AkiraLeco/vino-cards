"use client";

import { useEffect, useRef, useState } from "react";
import { loadMoreCards } from "@/app/home-actions";
import { HOME_PAGE_SIZE } from "@/lib/home";
import CardItem from "@/components/CardItem";
import type { Card, Game } from "@/lib/types";

/** Grade de cartas que carrega mais conforme a pessoa desce a página. A primeira página já vem pronta do servidor. */
export default function InfiniteCards({ game, initial }: { game: Game; initial: Card[] }) {
  const [cards, setCards] = useState(initial);
  const [done, setDone] = useState(initial.length < HOME_PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  const offset = useRef(initial.length);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done) return;
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
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [game, done]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((c) => (
          <CardItem key={c.id} card={c} />
        ))}
      </div>
      {!done && (
        <div ref={sentinel} className="py-6 text-center text-sm text-black/60" role="status">
          Carregando mais cartas...
        </div>
      )}
    </>
  );
}
