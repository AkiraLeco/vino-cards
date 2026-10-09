"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { STORE_NAME } from "@/lib/format";

export default function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm print:hidden">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-violet-700">
          {STORE_NAME}
        </Link>
        <form action="/" className="mx-2 flex flex-1">
          <input
            name="q"
            placeholder="Buscar carta pelo nome..."
            className="w-full rounded-l-md border border-r-0 border-black/20 px-3 py-2 text-sm outline-none focus:border-violet-600"
          />
          <button className="rounded-r-md bg-violet-700 px-5 text-sm font-bold text-white hover:bg-violet-800">
            Buscar
          </button>
        </form>
        <Link
          href="/carrinho"
          className="relative rounded-md border border-black/20 px-4 py-2 text-sm font-semibold hover:bg-black/5"
        >
          Carrinho
          {count > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-violet-700 px-1.5 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
      <nav className="bg-[#313131] text-sm text-white">
        <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-2">
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
