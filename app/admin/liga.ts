"use server";

import { createClient } from "@/lib/supabase/server";
import { lookupLiga, type LigaOffer } from "@/lib/liga";

export type LigaResult = { offers: LigaOffer[]; error?: string };

export async function fetchLigaPrice(input: {
  name: string;
  number?: string;
  setCode?: string;
}): Promise<LigaResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { offers: [], error: "Sessão expirada. Entre novamente." };

  try {
    return { offers: await lookupLiga(input) };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "erro desconhecido";
    console.error("[liga]", reason);
    return { offers: [], error: `Não consegui consultar a LigaPokémon (${reason}).` };
  }
}
