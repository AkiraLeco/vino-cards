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

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm print:hidden">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-violet-700 sm:text-2xl">
          {STORE_NAME}
        </Link>
        <Link
          href="/carrinho"
          className="relative order-2 ml-auto rounded-md border border-black/20 px-4 py-2 text-sm font-semibold hover:bg-black/5 md:order-3 md:ml-0"
        >
          Carrinho
          {count > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-violet-700 px-1.5 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </Link>
        <form action="/busca" className="order-3 flex w-full md:order-2 md:w-auto md:flex-1">
          <input
            name="q"
            placeholder="Buscar pelo nome..."
            className="w-full min-w-0 rounded-l-md border border-r-0 border-black/20 px-3 py-2 text-sm outline-none focus:border-violet-600"
          />
          <button className="rounded-r-md bg-violet-700 px-4 text-sm font-bold text-white hover:bg-violet-800 sm:px-5">
            Buscar
          </button>
        </form>
      </div>

      <nav className="bg-[#313131] text-sm text-white">
        {/* Computador: menus que abrem ao passar o mouse */}
        <div className="mx-auto hidden max-w-[1400px] gap-1 px-4 md:flex">
          <Link href="/" className="px-3 py-2.5 hover:bg-white/10">
            Início
          </Link>
          {(Object.keys(GAMES) as Game[]).map((g) => (
            <div key={g} className="group relative">
              <Link href={`/${g}/cartas`} className="block px-3 py-2.5 hover:bg-white/10 group-hover:bg-white/10">
                {GAMES[g]} ▾
              </Link>
              <div className="invisible absolute left-0 top-full z-50 min-w-52 bg-[#3d3d3d] py-1 opacity-0 shadow-lg group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {gameLinks(g).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block py-2 pr-4 hover:bg-white/10 ${l.indent ? "pl-8 text-white/80" : "pl-4"}`}
                  >
                    {l.indent && "↳ "}
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link href="/acessorios" className="px-3 py-2.5 hover:bg-white/10">
            Acessórios
          </Link>
          <Link href="/qr" className="px-3 py-2.5 hover:bg-white/10">
            QR Code
          </Link>
        </div>

        {/* Celular: botão que abre a lista completa */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            className="flex w-full items-center justify-between px-4 py-2.5 font-semibold"
          >
            <span>☰ Menu</span>
            <span>{menuOpen ? "▲" : "▼"}</span>
          </button>
          {menuOpen && (
            <div className="max-h-[70vh] overflow-y-auto border-t border-white/10 px-4 pb-3">
              <Link href="/" onClick={close} className="block py-2">
                Início
              </Link>
              {(Object.keys(GAMES) as Game[]).map((g) => (
                <div key={g} className="border-t border-white/10 py-2">
                  <p className="font-semibold text-violet-300">{GAMES[g]}</p>
                  {gameLinks(g).map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={close}
                      className={`block py-1.5 ${l.indent ? "pl-8 text-white/80" : "pl-4"}`}
                    >
                      {l.indent && "↳ "}
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link href="/acessorios" onClick={close} className="block border-t border-white/10 py-2">
                Acessórios
              </Link>
              <Link href="/qr" onClick={close} className="block border-t border-white/10 py-2">
                QR Code
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
