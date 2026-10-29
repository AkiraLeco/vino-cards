"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type PromoSlide = {
  href: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  background: string;
  /** Imagem opcional (ex.: /promo/novidades.webp) exibida atrás do texto. */
  image?: string;
};

const INTERVAL_MS = 5000;

/** Faixa de anúncios: troca de slide sozinha; pausa ao passar o mouse. */
export default function PromoBanner({ slides }: { slides: PromoSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || manual || reduce || slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, manual, slides.length]);

  return (
    <section
      className="relative overflow-hidden rounded-3xl text-white shadow-2xl shadow-ink/20 ring-1 ring-gold/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Anúncios"
    >
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <Link
            key={s.href + s.title}
            href={s.href}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className="relative block w-full shrink-0 px-6 py-14 sm:px-16 sm:py-24"
            style={{ background: s.background }}
          >
            {s.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(217,189,122,0.28),transparent_45%)]" />
            <div className="relative max-w-2xl">
              <p className="mb-4 inline-block rounded-full border border-gold-soft/60 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-soft">
                {s.eyebrow}
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] sm:text-6xl">{s.title}</h2>
              <p className="mt-3 text-base text-white/85 sm:text-lg">{s.text}</p>
              <span className="mt-8 inline-block rounded-full bg-gradient-to-r from-gold-soft to-gold px-8 py-3 text-sm font-bold uppercase tracking-wider text-ink shadow-lg transition hover:brightness-110">
                {s.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            aria-label="Anúncio anterior"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-xl backdrop-blur transition hover:bg-black/55 sm:grid"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            aria-label="Próximo anúncio"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-xl backdrop-blur transition hover:bg-black/55 sm:grid"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => setManual(!manual)}
            aria-pressed={manual}
            aria-label={manual ? "Retomar troca automática" : "Pausar troca automática"}
            className="absolute bottom-2.5 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/30 text-[10px] backdrop-blur transition hover:bg-black/55"
          >
            {manual ? "▶" : "❚❚"}
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir para o anúncio ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
