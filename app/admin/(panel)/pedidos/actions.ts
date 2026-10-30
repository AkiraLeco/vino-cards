"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { UUID } from "@/lib/validation";

const STATUSES = ["received", "paid", "delivered", "cancelled"];

export async function setOrderStatus(form: FormData): Promise<void> {
  const supabase = await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!UUID.test(id) || !STATUSES.includes(status)) return;
  const { error } = await supabase.rpc("set_order_status", { p_id: id, p_status: status });
  if (error) console.error("setOrderStatus", error);
  updateTag("cards");
  revalidatePath("/", "layout");
}
