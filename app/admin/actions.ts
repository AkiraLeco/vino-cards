"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const requireUser = requireAdmin;

export async function login(_: string | null, form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return "Informe um e-mail válido.";
  if (!password || password.length > 200) return "Informe a senha.";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "E-mail ou senha inválidos.";
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const num = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : Number(String(v).replace(",", "."));

const STATUSES = ["available", "reserved", "sold"];
const CATEGORY_KEYS = ["single", "sealed", "accessory"];
const GAME_KEYS = ["pokemon", "riftbound"];
const CONDITION_KEYS = ["M", "NM", "SP", "MP", "HP", "D"];

/** Devolve a mensagem de erro (mostrada no formulário) ou redireciona ao salvar. */
export async function saveCard(_: string | null, form: FormData): Promise<string | null> {
  const supabase = await requireUser();
  const id = String(form.get("id") ?? "");

  const name = String(form.get("name") ?? "").trim();
  if (!name) return "Informe o nome do item.";

  const rawPrice = num(form.get("price"));
  if (rawPrice === null) return "Informe o preço do item.";
  const price = rawPrice;
  if (!Number.isFinite(price) || price < 0) return "O preço precisa ser um número maior ou igual a zero.";
  const refPrice = num(form.get("ref_price"));
  if (refPrice !== null && (!Number.isFinite(refPrice) || refPrice < 0)) return "O preço de referência é inválido.";
  const rawQty = num(form.get("quantity")) ?? 1;
  if (!Number.isFinite(rawQty)) return "A quantidade precisa ser um número.";

  const category = String(form.get("category") ?? "single");
  if (!CATEGORY_KEYS.includes(category)) return "Tipo de item inválido.";
  const gameValue = String(form.get("game") ?? "pokemon");
  if (category !== "accessory" && !GAME_KEYS.includes(gameValue)) return "Jogo inválido.";
  const requestedStatus = String(form.get("status") ?? "available");
  if (!STATUSES.includes(requestedStatus)) return "Status inválido.";
  const condition = String(form.get("condition") ?? "NM");
  if (category === "single" && !CONDITION_KEYS.includes(condition)) return "Condição inválida.";

  // As fotos já foram enviadas ao Storage pelo navegador; aqui chegam só as URLs.
  const photos = String(form.get("photo_urls") ?? "")
    .split("\n")
    .filter(Boolean);

  const single = category === "single";
  const game = category === "accessory" ? null : gameValue;

  const quantity = Math.max(0, Math.floor(rawQty));

  const row = {
    game,
    category,
    api_card_id: single ? String(form.get("api_card_id") ?? "") || null : null,
    name,
    set_name: String(form.get("set_name") ?? "") || null,
    number: single ? String(form.get("number") ?? "") || null : null,
    rarity: single ? String(form.get("rarity") ?? "") || null : null,
    language: String(form.get("language") ?? "Português"),
    condition: single ? condition : "NM",
    is_foil: single && form.get("is_foil") === "on",
    price,
    ref_price: refPrice,
    quantity,
    status: quantity < 1 && requestedStatus === "available" ? "sold" : requestedStatus,
    image_api_url: String(form.get("image_api_url") ?? "") || null,
    photo_urls: photos,
    notes: String(form.get("notes") ?? "") || null,
    featured: form.get("featured") === "on",
  };

  const { error } = id
    ? await supabase.from("cards").update(row).eq("id", id)
    : await supabase.from("cards").insert(row);
  if (error) return `Não foi possível salvar: ${error.message}`;

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteCard(_: string | null, form: FormData): Promise<string | null> {
  const supabase = await requireUser();
  const { error } = await supabase.from("cards").delete().eq("id", String(form.get("id")));
  if (error) return `Não foi possível excluir: ${error.message}`;
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function setStatus(form: FormData): Promise<string | null> {
  const supabase = await requireUser();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!STATUSES.includes(status)) return "Status inválido.";
  const patch: { status: string; quantity?: number } = { status };
  if (status === "available") {
    // Voltar a "disponível" sem estoque deixaria a carta invisível: garante 1 unidade.
    const { data } = await supabase.from("cards").select("quantity").eq("id", id).single();
    if (data && data.quantity < 1) patch.quantity = 1;
  }
  const { error } = await supabase.from("cards").update(patch).eq("id", id);
  if (error) return `Não foi possível alterar o status: ${error.message}`;
  revalidatePath("/", "layout");
  return null;
}

export async function sellOne(_: string | null, form: FormData): Promise<string | null> {
  const supabase = await requireUser();
  const id = String(form.get("id"));
  const { data } = await supabase.from("cards").select("quantity").eq("id", id).single();
  if (!data) return "Item não encontrado.";
  const quantity = Math.max(0, data.quantity - 1);
  const { error } = await supabase
    .from("cards")
    .update(quantity === 0 ? { quantity, status: "sold" } : { quantity })
    .eq("id", id);
  if (error) return `Não foi possível registrar a venda: ${error.message}`;
  revalidatePath("/", "layout");
  return null;
}
