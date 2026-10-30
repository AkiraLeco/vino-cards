import type { Metadata } from "next";
import { catalogSeo } from "@/lib/seo";
import Catalog, { type SP } from "@/components/Catalog";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  return {
    ...catalogSeo("/acessorios", await searchParams),
    title: "Acessórios",
    description: "Playmats, sleeves, deckboxes e outros acessórios para cartas.",
  };
}


export default async function Acessorios({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <Catalog
      title="Acessórios"
      basePath="/acessorios"
      sp={await searchParams}
      category="accessory"
      mode="other"
    />
  );
}
