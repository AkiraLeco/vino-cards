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
  const supabase = createPublicClient();
  const statuses = ["available", "reserved"];
  // updated_at vem da migration 003; sem ela, cai em created_at.
  let res = await supabase.from("cards").select("id, created_at, updated_at").in("status", statuses).order("created_at").range(0, 4999);
  if (res.error) res = (await supabase.from("cards").select("id, created_at").in("status", statuses).order("created_at").range(0, 4999)) as typeof res;

  return [
    ...PAGES.map((p) => ({ url: `${base}${p}` })),
    ...(res.data ?? []).map((c) => ({
      url: `${base}/cartas/${c.id}`,
      lastModified: ("updated_at" in c && c.updated_at) || c.created_at,
    })),
  ];
}
