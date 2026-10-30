"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { LANGUAGES } from "@/lib/types";

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

const MAX_PRICE = 1_000_000;
const MAX_QTY = 100_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

/** Aceita só https de hosts conhecidos (Supabase Storage e imagens da API TCG). */
function safeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const supa = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
    return u.hostname === "images.pokemontcg.io" || u.hostname === supa;
  } catch {
    return false;
  }
}

/** Devolve a mensagem de erro (mostrada no formulário) ou redireciona ao salvar. */
export async function saveCard(_: string | null, form: FormData): Promise<string | null> {
  const supabase = await requireUser();
  const id = String(form.get("id") ?? "");
  if (id && !UUID.test(id)) return "Item inválido.";

  const name = text(form.get("name"), 200);
  if (!name) return "Informe o nome do item.";

  const rawPrice = num(form.get("price"));
  if (rawPrice === null) return "Informe o preço do item.";
  const price = rawPrice;
  if (!Number.isFinite(price) || price < 0 || price > MAX_PRICE) return "O preço precisa ser um número entre 0 e 1.000.000.";
  const refPrice = num(form.get("ref_price"));
  if (refPrice !== null && (!Number.isFinite(refPrice) || refPrice < 0 || refPrice > MAX_PRICE)) return "O preço de referência é inválido.";
  const rawQty = num(form.get("quantity")) ?? 1;
  if (!Number.isFinite(rawQty) || rawQty > MAX_QTY) return "A quantidade precisa ser um número válido.";
  const language = String(form.get("language") ?? "Português");
  if (!LANGUAGES.includes(language)) return "Idioma inválido.";

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
    .map((u) => u.trim())
    .filter(Boolean);
  if (photos.length > 10) return "Use no máximo 10 fotos.";
  if (!photos.every(safeUrl)) return "Uma das fotos tem endereço inválido. Envie a foto novamente.";
  const imageApiUrl = text(form.get("image_api_url"), 500);
  if (imageApiUrl && !safeUrl(imageApiUrl)) return "Endereço da imagem inválido.";

  const single = category === "single";
  const game = category === "accessory" ? null : gameValue;

  const quantity = Math.max(0, Math.floor(rawQty));

  const row = {
    game,
    category,
    api_card_id: single ? text(form.get("api_card_id"), 100) || null : null,
    name,
    set_name: text(form.get("set_name"), 200) || null,
    number: single ? text(form.get("number"), 30) || null : null,
    rarity: single ? text(form.get("rarity"), 60) || null : null,
    language,
    condition: single ? condition : "NM",
    is_foil: single && form.get("is_foil") === "on",
    price,
    ref_price: refPrice,
    quantity,
    status: quantity < 1 && requestedStatus === "available" ? "sold" : requestedStatus,
    image_api_url: imageApiUrl || null,
    photo_urls: photos,
    notes: text(form.get("notes"), 2000) || null,
    featured: form.get("featured") === "on",
  };

  const { error } = id
    ? await supabase.from("cards").update(row).eq("id", id)
    : await supabase.from("cards").insert(row);
  if (error) {
    console.error("saveCard", error);
    if (error.code === "42501")
      return "Sem permissão para salvar: seu usuário ainda não é admin no Supabase. Confira o passo do papel admin (migration 003) e entre de novo no /admin.";
    if (error.code === "23514") return "Algum valor foi recusado pelo banco (preço, quantidade, status ou condição). Revise os campos.";
    if (error.code === "PGRST204" || error.code === "42703") return "O banco está desatualizado: rode as migrations pendentes no Supabase.";
    return `Não foi possível salvar (código ${error.code ?? "desconhecido"}). Tente novamente.`;
  }

  updateTag("cards");
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteCard(_: string | null, form: FormData): Promise<string | null> {
  const supabase = await requireUser();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return "Item inválido.";
  const { data: old } = await supabase.from("cards").select("photo_urls").eq("id", id).maybeSingle();
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) {
    console.error("deleteCard", error);
    return "Não foi possível excluir. Tente novamente.";
  }
  // Remove as fotos do Storage para não deixar arquivos órfãos (falha aqui não impede a exclusão).
  const paths = (old?.photo_urls ?? [])
    .map((u: string) => u.split("/card-photos/")[1])
    .filter(Boolean)
    .map((p: string) => decodeURIComponent(p));
  if (paths.length) await supabase.storage.from("card-photos").remove(paths);
  updateTag("cards");
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function setStatus(form: FormData): Promise<string | null> {
  const supabase = await requireUser();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!UUID.test(id)) return "Item inválido.";
  if (!STATUSES.includes(status)) return "Status inválido.";
  const patch: { status: string; quantity?: number } = { status };
  if (status === "available") {
    // Voltar a "disponível" sem estoque deixaria a carta invisível: garante 1 unidade.
    const { data } = await supabase.from("cards").select("quantity").eq("id", id).single();
    if (data && data.quantity < 1) patch.quantity = 1;
  }
  const { error } = await supabase.from("cards").update(patch).eq("id", id);
  if (error) {
    console.error("setStatus", error);
    return "Não foi possível alterar o status.";
  }
  updateTag("cards");
  revalidatePath("/", "layout");
  return null;
}

export async function sellOne(_: string | null, form: FormData): Promise<string | null> {
  const supabase = await requireUser();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return "Item inválido.";
  // Atualização condicional ("só se a quantidade ainda for X"): duas vendas simultâneas não se atropelam.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await supabase.from("cards").select("quantity").eq("id", id).single();
    if (!data) return "Item não encontrado.";
    if (data.quantity < 1) return "Este item já está sem estoque.";
    const quantity = data.quantity - 1;
    const { data: updated, error } = await supabase
      .from("cards")
      .update(quantity === 0 ? { quantity, status: "sold" } : { quantity })
      .eq("id", id)
      .eq("quantity", data.quantity)
      .select("id");
    if (error) {
      console.error("sellOne", error);
      return "Não foi possível registrar a venda.";
    }
    if (updated?.length) {
      updateTag("cards");
  revalidatePath("/", "layout");
      return null;
    }
  }
  return "O estoque mudou durante a venda. Tente de novo.";
}
