import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Cliente sem cookies, só para leituras públicas. Não deixa a página dinâmica, então ela pode usar `revalidate`. */
export const createPublicClient = () =>
  createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
