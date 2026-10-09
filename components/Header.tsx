"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { STORE_NAME } from "@/lib/format";

export default function Header() {
  const { count } = useCart();
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
        <form action="/" className="order-3 flex w-full md:order-2 md:w-auto md:flex-1">
          <input
            name="q"
            placeholder="Buscar carta pelo nome..."
            className="w-full min-w-0 rounded-l-md border border-r-0 border-black/20 px-3 py-2 text-sm outline-none focus:border-violet-600"
          />
          <button className="rounded-r-md bg-violet-700 px-4 text-sm font-bold text-white hover:bg-violet-800 sm:px-5">
            Buscar
          </button>
        </form>
      </div>
      <nav className="bg-[#313131] text-sm text-white">
        <div className="mx-auto flex max-w-[1400px] gap-5 overflow-x-auto whitespace-nowrap px-4 py-2">
          <Link href="/" className="hover:text-violet-300">
            Todas as cartas
          </Link>
          <Link href="/?sort=price_desc" className="hover:text-violet-300">
            Mais valiosas
          </Link>
          <Link href="/apresentar" className="hover:text-violet-300">
            Mostrar em mãos
          </Link>
          <Link href="/qr" className="hover:text-violet-300">
            QR Code
          </Link>
        </div>
      </nav>
    </header>
  );
}
