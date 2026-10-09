"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartLine } from "@/lib/whatsapp";

interface Ctx {
  lines: CartLine[];
  count: number;
  add: (l: Omit<CartLine, "qty">, max: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartCtx = createContext<Ctx | null>(null);
const KEY = "vino-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

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
      const found = lines.find((x) => x.id === l.id);
      persist(
        found
          ? lines.map((x) =>
              x.id === l.id ? { ...x, qty: Math.min(max, x.qty + 1) } : x,
            )
          : [...lines, { ...l, qty: 1 }],
      );
    },
    setQty: (id, qty) =>
      persist(
        qty <= 0
          ? lines.filter((x) => x.id !== id)
          : lines.map((x) => (x.id === id ? { ...x, qty } : x)),
      ),
    remove: (id) => persist(lines.filter((x) => x.id !== id)),
    clear: () => persist([]),
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart fora do CartProvider");
  return c;
};
