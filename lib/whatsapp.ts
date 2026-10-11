import { brl } from "./format";

export interface CartLine {
  id: string;
  name: string;
  condition: string;
  price: number;
  qty: number;
  /** Estoque no momento em que entrou no carrinho (limite da quantidade). */
  max?: number;
}

export function whatsappUrl(lines: CartLine[], origin: string) {
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const body = lines
    .map(
      (l) =>
        `• ${l.qty}x ${l.name} (${l.condition}) - ${brl(l.price * l.qty)}\n  ${origin}/cartas/${l.id}`,
    )
    .join("\n");
  const text = `Olá! Tenho interesse nas cartas:\n\n${body}\n\nTotal: ${brl(total)}`;
  return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
