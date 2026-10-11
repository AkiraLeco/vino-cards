import { notFound } from "next/navigation";
import CardForm from "@/components/CardForm";
import DeleteCardForm from "@/components/DeleteCardForm";
import { requireAdmin } from "@/lib/auth";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await requireAdmin();
  const { data } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <CardForm card={data as Card} />
      <DeleteCardForm id={id} />
    </div>
  );
}
