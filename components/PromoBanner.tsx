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

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <section
      className="relative overflow-hidden rounded-3xl text-white shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
            className="relative block w-full shrink-0 px-6 py-10 sm:px-12 sm:py-14"
            style={{ background: s.background }}
          >
            {s.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            )}
            <div className="relative max-w-2xl">
              <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                {s.eyebrow}
              </p>
              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{s.title}</h2>
              <p className="mt-3 text-base text-white/85 sm:text-lg">{s.text}</p>
              <span className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-bold text-violet-700 shadow">
                {s.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>

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
