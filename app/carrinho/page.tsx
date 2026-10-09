"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { brl } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";

export default function CartPage() {
  const { lines, setQty, remove, clear } = useCart();
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  if (lines.length === 0)
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-black/70">Seu carrinho está vazio.</p>
        <Link href="/" className="rounded-lg bg-violet-700 px-5 py-2 font-bold text-white">
          Ver cartas
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-extrabold">Carrinho</h1>
      <ul className="divide-y divide-black/10 rounded-xl bg-black/5 ring-1 ring-black/10">
        {lines.map((l) => (
          <li key={l.id} className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <Link href={`/cartas/${l.id}`} className="font-semibold hover:underline">
                {l.name}
              </Link>
              <p className="text-xs text-black/60">{l.condition}</p>
            </div>
            <input
              type="number"
              min={1}
              value={l.qty}
              onChange={(e) => setQty(l.id, Number(e.target.value))}
              className="w-16 rounded bg-black/5 px-2 py-1 text-center"
            />
            <span className="w-24 text-right font-bold">{brl(l.price * l.qty)}</span>
            <button onClick={() => remove(l.id)} className="text-red-400" aria-label="Remover">
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between text-xl font-extrabold">
        <span>Total</span>
        <span className="text-violet-700">{brl(total)}</span>
      </div>
      <a
        href={whatsappUrl(lines, window.location.origin)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 block rounded-xl bg-green-500 py-3 text-center font-bold text-white"
      >
        Enviar pedido pelo WhatsApp
      </a>
      <button onClick={clear} className="mt-3 w-full text-sm text-black/50 hover:text-black">
        Esvaziar carrinho
      </button>
    </div>
  );
}
