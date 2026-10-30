import type { Metadata } from "next";

/**
 * Listagens com filtro, ordem ou paginação repetem o conteúdo da página base:
 * ficam fora do Google e apontam o canonical para a página sem parâmetros.
 */
export function catalogSeo(basePath: string, sp: Record<string, string | undefined>): Pick<Metadata, "alternates" | "robots"> {
  const filtered = Object.values(sp).some(Boolean);
  return {
    alternates: { canonical: basePath },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}
