"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const HANDLE = 44; // px, diâmetro da alça
const PAD = 4; // px, folga da trilha
const THRESHOLD = 0.7; // fração da trilha para confirmar

export default function SwipeTile({
  href,
  title,
  sub,
  color,
  icon,
  image,
  imagePosition = "center",
  cutout = false,
}: {
  href: string;
  title: string;
  sub: string;
  color: string;
  icon: string;
  image?: string;
  imagePosition?: string;
  /** Imagem recortada (PNG/WebP transparente): aparece inteira, sem máscara. */
  cutout?: boolean;
}) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const dxRef = useRef(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  // Voltar para a home (inclusive pelo cache do navegador) não deve deixar a alça no fim.
  useEffect(() => {
    const reset = () => {
      dxRef.current = 0;
      setDx(0);
      setDone(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const maxDx = () => Math.max(0, (trackRef.current?.clientWidth ?? 0) - HANDLE - PAD * 2);

  function move(d: number) {
    dxRef.current = d;
    setDx(d);
  }

  function onDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    setDragging(true);
  }

  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (startX.current === null) return;
    move(Math.min(Math.max(0, e.clientX - startX.current), maxDx()));
  }

  function onUp() {
    if (startX.current === null) return;
    startX.current = null;
    setDragging(false);
    const max = maxDx();
    if (max > 0 && dxRef.current >= max * THRESHOLD) {
      move(max);
      setDone(true);
      try {
        navigator.vibrate?.(30);
      } catch {}
      router.push(href);
    } else {
      move(0);
    }
  }

  const fill = dx + HANDLE + PAD * 2;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-md transition ${
        dragging ? "" : "hover:-translate-y-1 hover:shadow-xl"
      }`}
    >
      {image && imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          onError={() => setImgOk(false)}
          style={
            cutout
              ? { objectPosition: imagePosition }
              : {
                  objectPosition: imagePosition,
                  maskImage: "linear-gradient(to left, black 25%, transparent 95%)",
                  WebkitMaskImage: "linear-gradient(to left, black 25%, transparent 95%)",
                }
          }
          className={`pointer-events-none absolute right-0 top-0 ${
            cutout
              ? "bottom-[88px] w-[42%] object-contain object-right-bottom p-2 opacity-95 drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
              : "h-full w-4/5 object-cover opacity-80"
          }`}
        />
      ) : (
        <span className="pointer-events-none absolute -right-2 -top-3 text-7xl opacity-25 transition group-hover:scale-110">
          {icon}
        </span>
      )}

      {/* Escurece levemente o lado do texto para dar contraste */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

      <Link href={href} className="relative block rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-white">
        <h2 className="text-2xl font-extrabold [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">{title}</h2>
        <p className={`mt-1 text-sm ${image && imgOk ? "max-w-[70%]" : ""} text-white/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]`}>{sub}</p>
        <span className="mt-4 inline-block text-sm font-semibold">Explorar →</span>
      </Link>

      <div
        ref={trackRef}
        aria-hidden="true"
        className="relative mt-4 h-[52px] select-none overflow-hidden rounded-full bg-black/30 shadow-inner"
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-white/35 ${
            dragging ? "" : "transition-[width] duration-200 motion-reduce:transition-none"
          }`}
          style={{ width: dx > 0 || done ? fill : 0 }}
        />
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 pl-10 text-xs font-semibold uppercase tracking-wider text-white"
          style={{ opacity: done ? 1 : Math.max(0, 1 - dx / 90) }}
        >
          {done ? (
            "Entrando…"
          ) : (
            <>
              Deslize para entrar <span className="swipe-chevrons text-base">›››</span>
            </>
          )}
        </span>
        <button
          type="button"
          tabIndex={-1}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            top: PAD,
            left: PAD,
            width: HANDLE,
            height: HANDLE,
            transform: `translateX(${dx}px)`,
            touchAction: "pan-y",
          }}
          className={`absolute z-10 flex cursor-grab items-center justify-center rounded-full bg-white text-lg font-bold text-slate-800 shadow-md active:cursor-grabbing ${
            dragging ? "" : "transition-transform duration-200 motion-reduce:transition-none"
          } ${dx === 0 && !dragging && !done ? "swipe-hint" : ""}`}
        >
          {done ? "✓" : "→"}
        </button>
      </div>
    </div>
  );
}
