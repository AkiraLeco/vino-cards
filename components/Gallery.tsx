"use client";

import { useEffect, useRef, useState } from "react";
import CardImage from "./CardImage";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const current = images[i] ?? images[0];

  useEffect(() => {
    if (!zoom) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl border border-gold/20 bg-gradient-to-b from-violet-50 to-white p-4 shadow-sm sm:p-8">
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label="Ampliar imagem"
          className="relative mx-auto block aspect-[5/7] w-full max-w-[480px] cursor-zoom-in"
        >
          <CardImage
            src={current}
            alt={alt}
            priority
            sizes="(min-width:1024px) 480px, 90vw"
            className="rounded-lg object-contain drop-shadow-xl"
          />
          <span className="absolute bottom-1 right-1 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold text-white">
            Ampliar
          </span>
        </button>
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((u, idx) => (
            <button
              key={u}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Ver foto ${idx + 1}`}
              className={`overflow-hidden rounded-lg border-2 bg-white p-1 transition ${
                idx === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <div className="relative h-20 w-14">
                <CardImage src={u} alt="" sizes="56px" className="object-contain" />
              </div>
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} ampliada`}
          className="fixed inset-0 z-[70] grid place-items-center bg-ink/90 p-4 backdrop-blur-sm"
          onClick={() => setZoom(false)}
        >
          <button
            ref={closeBtn}
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl text-white hover:bg-white/30"
          >
            ✕
          </button>
          <div className="relative h-[88vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <CardImage src={current} alt={alt} sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
