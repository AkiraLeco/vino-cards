"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { STORE_NAME } from "@/lib/format";

export default function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#120a2a]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-yellow-400">
          {STORE_NAME}
        </Link>
        <form action="/" className="mx-2 flex flex-1">
          <input
            name="q"
            placeholder="Buscar carta..."
            className="w-full rounded-l-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/50"
          />
          <button className="rounded-r-lg bg-yellow-400 px-4 text-sm font-bold text-black">
            Buscar
          </button>
        </form>
        <Link href="/apresentar" className="hidden text-sm text-white/80 hover:text-white sm:block">
          Mostrar em mãos
        </Link>
        <Link
          href="/carrinho"
          className="relative rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
        >
          Carrinho
          {count > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-black">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
