"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { CONDITIONS, type Card } from "@/lib/types";

export default function AddToCart({ card }: { card: Card }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const disabled = card.status !== "available" || card.quantity < 1;

  return (
    <button
      disabled={disabled}
      onClick={() => {
        add(
          {
            id: card.id,
            name: card.name,
            condition: CONDITIONS[card.condition],
            price: card.price,
          },
          card.quantity,
        );
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="w-full rounded-xl bg-yellow-400 py-3 font-bold text-black disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
    >
      {disabled ? "Indisponível" : done ? "Adicionada ✓" : "Adicionar ao carrinho"}
    </button>
  );
}
