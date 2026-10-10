"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const HANDLE = 44; // px, diâmetro da alça
const THRESHOLD = 0.7; // fração da trilha para confirmar

export default function SwipeTile({
  href,
  title,
  sub,
  color,
  icon,
  image,
  imagePosition = "center",
}: {
  href: string;
  title: string;
  sub: string;
  color: string;
  icon: string;
  image?: string;
  imagePosition?: string;
}) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; id: number } | null>(null);
  const moved = useRef(false);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  const maxDx = () => Math.max(0, (trackRef.current?.clientWidth ?? 0) - HANDLE - 8);

  function onDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, id: e.pointerId };
    moved.current = false;
    setDragging(true);
  }

  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!start.current) return;
    const d = Math.min(Math.max(0, e.clientX - start.current.x), maxDx());
    if (d > 5) moved.current = true;
    setDx(d);
  }

  function onUp() {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    const max = maxDx();
    if (max > 0 && dx >= max * THRESHOLD) {
      setDx(max);
      router.push(href);
    } else {
      setDx(0);
    }
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl`}
    >
      {image && imgOk ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            onError={() => setImgOk(false)}
            style={{
              objectPosition: imagePosition,
              maskImage: "linear-gradient(to left, black 10%, transparent 90%)",
              WebkitMaskImage: "linear-gradient(to left, black 10%, transparent 90%)",
            }}
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/4 object-cover opacity-70 mix-blend-soft-light"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            style={{
              objectPosition: imagePosition,
              maskImage: "linear-gradient(to left, black 0%, transparent 75%)",
              WebkitMaskImage: "linear-gradient(to left, black 0%, transparent 75%)",
            }}
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/4 object-cover opacity-50"
          />
        </>
      ) : (
        <span className="pointer-events-none absolute -right-2 -top-3 text-7xl opacity-25 transition group-hover:scale-110">
          {icon}
        </span>
      )}

      <Link href={href} className="relative block rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-white">
        <h2 className="text-2xl font-extrabold drop-shadow">{title}</h2>
        <p className="mt-1 text-sm text-white/90 drop-shadow">{sub}</p>
        <span className="mt-4 inline-block text-sm font-semibold">Explorar →</span>
      </Link>

      <div
        ref={trackRef}
        aria-hidden="true"
        className="relative mt-4 flex h-[52px] select-none items-center overflow-hidden rounded-full bg-black/25 p-1 backdrop-blur-sm"
      >
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center pl-8 text-xs font-semibold uppercase tracking-wider text-white/80"
          style={{ opacity: Math.max(0, 1 - dx / 80) }}
        >
          Deslize para entrar
        </span>
        <button
          type="button"
          tabIndex={-1}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            width: HANDLE,
            height: HANDLE,
            transform: `translateX(${dx}px)`,
            touchAction: "pan-y",
          }}
          className={`relative z-10 flex cursor-grab items-center justify-center rounded-full bg-white text-lg font-bold text-slate-800 shadow active:cursor-grabbing ${
            dragging ? "" : "transition-transform duration-200 motion-reduce:transition-none"
          }`}
        >
          →
        </button>
      </div>
    </div>
  );
}
