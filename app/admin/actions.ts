"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return supabase;
}

export async function login(_: string | null, form: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email")),
    password: String(form.get("password")),
  });
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

export async function saveCard(form: FormData) {
  const supabase = await requireUser();
  const id = String(form.get("id") ?? "");

  // As fotos já foram enviadas ao Storage pelo navegador; aqui chegam só as URLs.
  const photos = String(form.get("photo_urls") ?? "")
    .split("\n")
    .filter(Boolean);

  const category = String(form.get("category") ?? "single");
  const single = category === "single";
  const game = category === "accessory" ? null : String(form.get("game") ?? "pokemon");

  const quantity = Math.max(0, num(form.get("quantity")) ?? 1);
  const requestedStatus = String(form.get("status") ?? "available");

  const row = {
    game,
    category,
    api_card_id: single ? String(form.get("api_card_id") ?? "") || null : null,
    name: String(form.get("name")),
    set_name: String(form.get("set_name") ?? "") || null,
    number: single ? String(form.get("number") ?? "") || null : null,
    rarity: single ? String(form.get("rarity") ?? "") || null : null,
    language: String(form.get("language") ?? "Português"),
    condition: single ? String(form.get("condition") ?? "NM") : "NM",
    is_foil: single && form.get("is_foil") === "on",
    price: num(form.get("price")) ?? 0,
    ref_price: num(form.get("ref_price")),
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
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteCard(form: FormData) {
  const supabase = await requireUser();
  await supabase.from("cards").delete().eq("id", String(form.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function setStatus(form: FormData) {
  const supabase = await requireUser();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  const patch: { status: string; quantity?: number } = { status };
  if (status === "available") {
    // Voltar a "disponível" sem estoque deixaria a carta invisível: garante 1 unidade.
    const { data } = await supabase.from("cards").select("quantity").eq("id", id).single();
    if (data && data.quantity < 1) patch.quantity = 1;
  }
  await supabase.from("cards").update(patch).eq("id", id);
  revalidatePath("/", "layout");
}

export async function sellOne(form: FormData) {
  const supabase = await requireUser();
  const id = String(form.get("id"));
  const { data } = await supabase.from("cards").select("quantity").eq("id", id).single();
  if (!data) return;
  const quantity = Math.max(0, data.quantity - 1);
  await supabase
    .from("cards")
    .update(quantity === 0 ? { quantity, status: "sold" } : { quantity })
    .eq("id", id);
  revalidatePath("/", "layout");
}
