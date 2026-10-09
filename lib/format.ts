export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Vino Cards";
