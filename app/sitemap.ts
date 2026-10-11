import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

const PAGES = [
  "",
  "/pokemon/cartas",
  "/pokemon/selados",
  "/pokemon/colecoes",
  "/riftbound/cartas",
  "/riftbound/selados",
  "/riftbound/colecoes",
  "/acessorios",
  "/qr",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { data } = await createPublicClient()
    .from("cards")
    .select("id, created_at")
    .in("status", ["available", "reserved"]);

  return [
    ...PAGES.map((p) => ({ url: `${base}${p}` })),
    ...(data ?? []).map((c) => ({ url: `${base}/cartas/${c.id}`, lastModified: c.created_at })),
  ];
}
