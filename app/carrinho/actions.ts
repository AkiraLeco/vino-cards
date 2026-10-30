"use server";

import { updateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type OrderResult =
  | { ok: true; number: number; total: number }
  | { ok: false; error: string; unavailable?: boolean };

const MESSAGES: Record<string, string> = {
  NOME_INVALIDO: "Informe seu nome.",
  TELEFONE_INVALIDO: "Informe um telefone com DDD.",
  ITENS_INVALIDOS: "O carrinho tem itens inválidos.",
  SEM_ESTOQUE: "Algum item acabou de ser vendido ou não tem mais a quantidade pedida. Atualize o carrinho e tente de novo.",
};

/** Registra o pedido e reserva o estoque (função create_order do banco). */
export async function createOrder(input: {
  name: string;
  phone: string;
  note: string;
  items: { id: string; qty: number }[];
}): Promise<OrderResult> {
  const items = (input.items ?? []).map((i) => ({ id: String(i.id), qty: Math.floor(Number(i.qty)) }));
  const { data, error } = await createPublicClient().rpc("create_order", {
    p_name: String(input.name ?? ""),
    p_phone: String(input.phone ?? ""),
    p_note: String(input.note ?? ""),
    p_items: items,
  });
  if (error) {
    // Função ainda não criada no banco (migration 004 pendente): o carrinho segue pelo WhatsApp, sem registro.
    if (error.code === "PGRST202") return { ok: false, error: "", unavailable: true };
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k));
    if (!key) console.error("createOrder", error);
    return { ok: false, error: key ? MESSAGES[key] : "Não foi possível registrar o pedido. Tente novamente." };
  }
  const row = Array.isArray(data) ? data[0] : data;
  updateTag("cards");
  return { ok: true, number: Number(row.order_number), total: Number(row.order_total) };
}
