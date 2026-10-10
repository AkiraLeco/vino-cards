"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Carrossel horizontal com encaixe (snap) e setas; cada item abre só por clique. */
export default function TileCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  function go(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  const arrow =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-800 shadow-[0_6px_16px_-6px_rgba(23,27,53,0.5)] transition hover:scale-105 sm:flex";

  return (
    <div className="relative">
      <div
        ref={ref}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-8 pt-2 -mb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {canPrev && (
        <button type="button" aria-label="Anterior" onClick={() => go(-1)} className={`${arrow} -left-3`}>
          ‹
        </button>
      )}
      {canNext && (
        <button type="button" aria-label="Próximo" onClick={() => go(1)} className={`${arrow} -right-3`}>
          ›
        </button>
      )}
    </div>
  );
}
