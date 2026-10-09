import Link from "next/link";
import { brl } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cardImage, type Card } from "@/lib/types";
import StatusSelect from "@/components/StatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminList() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });
  const cards = (data ?? []) as Card[];

  return (
    <div className="flex flex-col gap-2">
      {cards.length === 0 && <p className="text-white/60">Nenhuma carta cadastrada ainda.</p>}
      {cards.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cardImage(c)} alt="" className="h-16 w-12 object-contain" />
          <div className="flex-1">
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-white/60">
              {c.set_name} · {c.condition} · qtd {c.quantity}
            </p>
          </div>
          <span className="font-bold text-yellow-400">{brl(c.price)}</span>
          <StatusSelect id={c.id} status={c.status} />
          <Link href={`/admin/${c.id}`} className="text-sm underline">
            Editar
          </Link>
        </div>
      ))}
    </div>
  );
}
