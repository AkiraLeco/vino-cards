import { brl } from "./format";

export interface CartLine {
  id: string;
  name: string;
  condition: string;
  price: number;
  qty: number;
  /** Estoque no momento em que entrou no carrinho (limite da quantidade). */
  max?: number;
  /** Miniatura exibida no carrinho. */
  image?: string;
}

export function whatsappUrl(lines: CartLine[], origin: string, orderNumber?: number) {
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const body = lines
    .map(
      (l) =>
        `• ${l.qty}x ${l.name} (${l.condition}) - ${brl(l.price * l.qty)}\n  ${origin}/cartas/${l.id}`,
    )
    .join("\n");
  const head = orderNumber
    ? `Olá! Fiz o pedido #${String(orderNumber).padStart(4, "0")} no site:`
    : "Olá! Tenho interesse nas cartas:";
  const text = `${head}\n\n${body}\n\nTotal: ${brl(total)}`;
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
