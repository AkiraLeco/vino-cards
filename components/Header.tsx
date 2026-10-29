"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { STORE_NAME } from "@/lib/format";
import { GAMES, type Game } from "@/lib/types";

const gameLinks = (g: Game) => [
  { href: `/${g}/selados`, label: "Produtos Selados", indent: false },
  { href: `/${g}/cartas`, label: "Cartas Avulsas", indent: false },
  { href: `/${g}/colecoes`, label: "Coleções", indent: true },
];

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function CartIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

const roundBtn =
  "relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 transition hover:border-gold hover:bg-violet-50";

const sideItem =
  "block rounded-lg px-3 py-2.5 font-medium hover:bg-violet-50 hover:text-violet-700";

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  // Sidebar aberta: foco entra no painel, Tab fica preso nele, Esc fecha e o foco volta ao botão.
  useEffect(() => {
    if (!open) return;
    const btn = menuBtn.current;
    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setTimeout(() => btn?.focus(), 0);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-white/85 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-3 sm:gap-3">
          <button
            ref={menuBtn}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={open}
            className={roundBtn}
          >
            <MenuIcon />
          </button>

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            onClick={close}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-xl font-bold text-gold-soft shadow-sm ring-1 ring-gold/60">
              V
            </span>
            <span className="hidden font-display text-2xl font-semibold tracking-wide sm:inline">
              {STORE_NAME}
            </span>
          </Link>

          <nav aria-label="Principal" className="ml-2 hidden items-center gap-1 xl:flex">
            {[
              ["/pokemon/cartas", "Pokémon"],
              ["/riftbound/cartas", "Riftbound"],
              ["/acessorios", "Acessórios"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink/75 transition hover:bg-violet-50 hover:text-gold-deep"
              >
                {label}
              </Link>
            ))}
          </nav>

          <form
            action="/busca"
            className="mx-1 flex min-w-0 flex-1 sm:mx-3 md:mx-auto md:max-w-xl"
          >
            <input
              name="q"
              placeholder="Buscar pelo nome..."
              aria-label="Buscar"
              className="w-full min-w-0 rounded-l-full border border-r-0 border-black/10 bg-black/[0.03] px-5 py-2 text-sm outline-none transition focus:border-gold focus:bg-white"
            />
            <button className="rounded-r-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-gold-deep">
              Buscar
            </button>
          </form>

          <Link href="/conta" aria-label="Minha conta" className={roundBtn}>
            <UserIcon />
          </Link>

          <Link href="/carrinho" aria-label="Carrinho" className={roundBtn}>
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Sidebar (fora do header: o backdrop-blur dele prenderia o position:fixed) */}
      <div
        className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        inert={!open}
      >
        <div
          onClick={close}
          className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <nav
          ref={panel}
          aria-label="Menu"
          className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto bg-white p-4 shadow-2xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-2xl font-semibold tracking-wide">{STORE_NAME}</span>
            <button
              type="button"
              onClick={close}
              aria-label="Fechar menu"
              className="rounded-full px-3 py-1.5 text-lg leading-none hover:bg-black/5"
            >
              ✕
            </button>
          </div>
          <Link href="/" onClick={close} className={sideItem}>
            Início
          </Link>
          {(Object.keys(GAMES) as Game[]).map((g) => (
            <div key={g} className="mt-2 border-t border-black/5 pt-3">
              <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">
                {GAMES[g]}
              </p>
              {gameLinks(g).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className={`block rounded-lg py-2 hover:bg-violet-50 hover:text-violet-700 ${
                    l.indent ? "pl-8 pr-3 text-sm text-black/55" : "px-3"
                  }`}
                >
                  {l.indent && "↳ "}
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="mt-2 border-t border-black/5 pt-3">
            <Link href="/acessorios" onClick={close} className={sideItem}>
              Acessórios
            </Link>
            <Link href="/qr" onClick={close} className={sideItem}>
              QR Code
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
