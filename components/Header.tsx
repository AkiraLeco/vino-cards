"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { STORE_NAME } from "@/lib/format";
import { GAMES, type Game } from "@/lib/types";

const gameLinks = (g: Game) => [
  { href: `/${g}/selados`, label: "Produtos Selados", indent: false },
  { href: `/${g}/cartas`, label: "Cartas Avulsas", indent: false },
  { href: `/${g}/colecoes`, label: "Coleções", indent: true },
];

const navItem =
  "rounded-lg px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-violet-50 hover:text-violet-700";

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={close}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-black text-white shadow-sm">
            V
          </span>
          <span className="text-lg font-extrabold tracking-tight sm:text-xl">{STORE_NAME}</span>
        </Link>

        {/* Computador: menus que abrem ao passar o mouse */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Principal">
          <Link href="/" className={navItem}>
            Início
          </Link>
          {(Object.keys(GAMES) as Game[]).map((g) => (
            <div key={g} className="group relative">
              <Link href={`/${g}/cartas`} className={`${navItem} flex items-center gap-1 group-hover:bg-violet-50 group-hover:text-violet-700`}>
                {GAMES[g]}
                <span className="text-[10px]">▾</span>
              </Link>
              <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="min-w-56 rounded-xl border border-black/5 bg-white p-1.5 shadow-xl">
                  {gameLinks(g).map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`block rounded-lg py-2 pr-3 text-sm hover:bg-violet-50 hover:text-violet-700 ${
                        l.indent ? "pl-8 text-black/55" : "pl-3 font-medium"
                      }`}
                    >
                      {l.indent && "↳ "}
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <Link href="/acessorios" className={navItem}>
            Acessórios
          </Link>
          <Link href="/qr" className={navItem}>
            QR Code
          </Link>
        </nav>

        <form action="/busca" className="order-last flex w-full md:order-none md:ml-auto md:w-72 lg:w-80">
          <input
            name="q"
            placeholder="Buscar pelo nome..."
            aria-label="Buscar"
            className="w-full min-w-0 rounded-l-full border border-r-0 border-black/10 bg-black/[0.03] px-4 py-2 text-sm outline-none transition focus:border-violet-500 focus:bg-white"
          />
          <button className="rounded-r-full bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700">
            Buscar
          </button>
        </form>

        <Link
          href="/carrinho"
          onClick={close}
          className="relative ml-auto flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition hover:border-violet-300 hover:bg-violet-50 md:ml-0"
        >
          <CartIcon />
          <span className="hidden sm:inline">Carrinho</span>
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-violet-600 px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Menu"
          className="rounded-full border border-black/10 px-3 py-2 text-lg leading-none lg:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Celular: lista completa */}
      {menuOpen && (
        <nav className="max-h-[70vh] overflow-y-auto border-t border-black/5 bg-white px-4 pb-4 lg:hidden" aria-label="Menu">
          <Link href="/" onClick={close} className="block py-3 font-medium">
            Início
          </Link>
          {(Object.keys(GAMES) as Game[]).map((g) => (
            <div key={g} className="border-t border-black/5 py-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-violet-600">{GAMES[g]}</p>
              {gameLinks(g).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className={`block py-1.5 ${l.indent ? "pl-6 text-sm text-black/55" : ""}`}
                >
                  {l.indent && "↳ "}
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          <Link href="/acessorios" onClick={close} className="block border-t border-black/5 py-3 font-medium">
            Acessórios
          </Link>
          <Link href="/qr" onClick={close} className="block border-t border-black/5 py-3 font-medium">
            QR Code
          </Link>
        </nav>
      )}
    </header>
  );
}
