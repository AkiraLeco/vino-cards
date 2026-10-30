"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartLine } from "@/lib/whatsapp";

interface Ctx {
  lines: CartLine[];
  count: number;
  add: (l: Omit<CartLine, "qty" | "max">, max: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Confere preço e estoque atuais no banco; remove itens vendidos e ajusta quantidades. */
  refresh: () => Promise<void>;
}

const CartCtx = createContext<Ctx | null>(null);
const KEY = "vino-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const value: Ctx = {
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    add: (l, max) => {
      setToast(l.name);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 3500);
      const found = lines.find((x) => x.id === l.id);
      persist(
        found
          ? lines.map((x) =>
              x.id === l.id ? { ...x, max, qty: Math.min(max, x.qty + 1) } : x,
            )
          : [...lines, { ...l, qty: 1, max }],
      );
    },
    setQty: (id, qty) =>
      persist(
        qty <= 0
          ? lines.filter((x) => x.id !== id)
          : lines.map((x) => (x.id === id ? { ...x, qty: Math.min(x.max ?? Infinity, Math.floor(qty) || 1) } : x)),
      ),
    remove: (id) => persist(lines.filter((x) => x.id !== id)),
    clear: () => persist([]),
    refresh: async () => {
      if (!lines.length) return;
      const { data, error } = await createClient()
        .from("cards")
        .select("id, price, quantity, status")
        .in("id", lines.map((l) => l.id));
      if (error || !data) return;
      const fresh = new Map(data.map((r) => [r.id as string, r]));
      persist(
        lines.flatMap((l) => {
          const r = fresh.get(l.id);
          if (!r || r.status === "sold" || r.quantity < 1) return [];
          return [{ ...l, price: Number(r.price), max: r.quantity, qty: Math.min(l.qty, r.quantity) }];
        }),
      );
    },
  };

  return (
    <CartCtx.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] mx-auto max-w-sm print:hidden">
        {toast && (
          <div className="fade-up pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-gold/50">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-ink">✓</span>
            <span className="min-w-0 flex-1 truncate">{toast} adicionada</span>
            <Link href="/carrinho" onClick={() => setToast(null)} className="shrink-0 font-semibold text-gold-soft underline underline-offset-4">
              Ver carrinho
            </Link>
          </div>
        )}
      </div>
    </CartCtx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart fora do CartProvider");
  return c;
};
