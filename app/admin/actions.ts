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

  const existing = String(form.get("existing_photos") ?? "")
    .split("\n")
    .filter(Boolean);
  const uploaded: string[] = [];
  for (const f of form.getAll("photos")) {
    if (!(f instanceof File) || f.size === 0) continue;
    const path = `${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("card-photos").upload(path, f);
    if (!error)
      uploaded.push(supabase.storage.from("card-photos").getPublicUrl(path).data.publicUrl);
  }

  const row = {
    api_card_id: String(form.get("api_card_id") ?? "") || null,
    name: String(form.get("name")),
    set_name: String(form.get("set_name") ?? "") || null,
    number: String(form.get("number") ?? "") || null,
    rarity: String(form.get("rarity") ?? "") || null,
    language: String(form.get("language")),
    condition: String(form.get("condition")),
    is_foil: form.get("is_foil") === "on",
    price: num(form.get("price")) ?? 0,
    ref_price: num(form.get("ref_price")),
    quantity: num(form.get("quantity")) ?? 1,
    status: String(form.get("status")),
    image_api_url: String(form.get("image_api_url") ?? "") || null,
    photo_urls: [...existing, ...uploaded],
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
  await supabase
    .from("cards")
    .update({ status: String(form.get("status")) })
    .eq("id", String(form.get("id")));
  revalidatePath("/", "layout");
}
