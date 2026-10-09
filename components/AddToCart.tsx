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
      className="w-full rounded-xl bg-violet-700 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/50"
    >
      {disabled ? (card.status === "reserved" ? "Reservada" : card.status === "sold" ? "Vendida" : "Indisponível") : done ? "Adicionada ✓" : "Adicionar ao carrinho"}
    </button>
  );
}
