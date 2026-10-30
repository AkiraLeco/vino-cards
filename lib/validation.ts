export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Aceita só https de hosts conhecidos (Supabase Storage e imagens da API TCG). */
export function safeUrl(raw: string, supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const supa = supabaseUrl ? new URL(supabaseUrl).hostname : null;
    return u.hostname === "images.pokemontcg.io" || u.hostname === supa;
  } catch {
    return false;
  }
}

/** Célula de CSV; valores que o Excel leria como fórmula ganham um apóstrofo (CSV injection). */
export function csvCell(v: unknown): string {
  let t = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(t) && !/^-?\d+([.,]\d+)?$/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
}
