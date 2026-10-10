import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Confere o login ANTES de buscar qualquer dado. Cada página do admin chama isto:
 * o layout renderiza em paralelo com a página, então só ele não basta.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return supabase;
}
