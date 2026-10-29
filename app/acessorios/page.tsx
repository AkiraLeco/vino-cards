import Catalog, { type SP } from "@/components/Catalog";

export const metadata = {
  title: "Acessórios",
  description: "Playmats, sleeves, deckboxes e outros acessórios para cartas.",
};

export const dynamic = "force-dynamic";

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
