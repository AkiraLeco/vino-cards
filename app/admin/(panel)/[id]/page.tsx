import { notFound } from "next/navigation";
import CardForm from "@/components/CardForm";
import { requireAdmin } from "@/lib/auth";
import type { Card } from "@/lib/types";
import { deleteCard } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await requireAdmin();
  const { data } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <CardForm card={data as Card} />
      <form action={deleteCard} className="mx-auto mt-4 max-w-2xl">
        <input type="hidden" name="id" value={id} />
        <button className="text-sm text-red-400 hover:underline">Excluir carta</button>
      </form>
    </div>
  );
}
