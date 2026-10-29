"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { CONDITIONS, cardImage, type Card } from "@/lib/types";

/** Botão "adicionar" que aparece sobre o card ao passar o mouse (sempre visível no toque). */
export default function QuickAdd({ card }: { card: Card }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(
          { id: card.id, name: card.name, condition: CONDITIONS[card.condition], price: card.price, image: cardImage(card) },
          card.quantity,
        );
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      aria-label={`Adicionar ${card.name} ao carrinho`}
      className="absolute inset-x-3 bottom-[4.6rem] z-10 rounded-full bg-ink/95 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur transition hover:bg-gold-deep focus-visible:opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 sm:group-focus-within/card:opacity-100"
    >
      {done ? "Adicionada ✓" : "+ Adicionar"}
    </button>
  );
}
