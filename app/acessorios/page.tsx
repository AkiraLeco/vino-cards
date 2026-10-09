import Catalog, { type SP } from "@/components/Catalog";

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
