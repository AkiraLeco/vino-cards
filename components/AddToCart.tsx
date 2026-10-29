"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { CONDITIONS, cardImage, type Card } from "@/lib/types";

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
            image: cardImage(card),
          },
          card.quantity,
        );
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="w-full rounded-xl bg-ink py-4 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-ink/20 transition hover:bg-gold-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/50 disabled:shadow-none"
    >
      {disabled ? (card.status === "reserved" ? "Reservada" : card.status === "sold" ? "Vendida" : "Indisponível") : done ? "Adicionada ✓" : "Adicionar ao carrinho"}
    </button>
  );
}
