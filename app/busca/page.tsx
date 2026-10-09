import Catalog, { type SP } from "@/components/Catalog";

export const dynamic = "force-dynamic";

export default async function Busca({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <Catalog
      title={sp.q ? `Resultados para "${sp.q}"` : "Todos os itens"}
      basePath="/busca"
      sp={sp}
      mode="other"
    />
  );
}
