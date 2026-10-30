import { requireAdmin } from "@/lib/auth";
import { brl } from "@/lib/format";
import { setOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

interface Order {
  id: string;
  number: number;
  customer_name: string;
  customer_phone: string;
  note: string | null;
  total: number;
  status: "received" | "paid" | "delivered" | "cancelled";
  created_at: string;
  expires_at: string;
  order_items: { id: string; name: string; condition: string | null; price: number; qty: number }[];
}

const LABEL = { received: "Recebido", paid: "Pago", delivered: "Entregue", cancelled: "Cancelado" } as const;
const COLOR = {
  received: "bg-amber-100 text-amber-800",
  paid: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-black/10 text-black/55",
} as const;
const NEXT: Record<string, [string, string][]> = {
  received: [["paid", "Marcar como pago"], ["cancelled", "Cancelar e devolver ao estoque"]],
  paid: [["delivered", "Marcar como entregue"], ["cancelled", "Cancelar e devolver ao estoque"]],
  delivered: [],
  cancelled: [],
};

export default async function Pedidos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await requireAdmin();
  let query = supabase
    .from("orders")
    .select("*, order_items(id, name, condition, price, qty)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (sp.status && sp.status in LABEL) query = query.eq("status", sp.status);
  const { data, error } = await query;
  const orders = (data ?? []) as Order[];

  const tab = (value: string, label: string) => (
    <a
      key={value}
      href={value ? `/admin/pedidos?status=${value}` : "/admin/pedidos"}
      className={`rounded-full px-3 py-1.5 text-sm font-medium ${(sp.status ?? "") === value ? "bg-ink text-white" : "bg-white ring-1 ring-black/10"}`}
    >
      {label}
    </a>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tab("", "Todos")}
        {Object.entries(LABEL).map(([k, v]) => tab(k, v))}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Não foi possível carregar os pedidos. Confirme que as migrations 003 e 004 foram executadas no Supabase.
        </p>
      )}
      {!error && orders.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-sm text-black/55">Nenhum pedido.</p>}

      {orders.map((o) => (
        <article key={o.id} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="font-display text-2xl font-bold">Pedido #{String(o.number).padStart(4, "0")}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLOR[o.status]}`}>{LABEL[o.status]}</span>
            <span className="ml-auto font-display text-2xl font-bold">{brl(Number(o.total))}</span>
          </div>
          <p className="mt-1 text-sm text-black/60">
            {o.customer_name} ·{" "}
            <a className="underline" href={`https://wa.me/55${o.customer_phone.replace(/\D/g, "").replace(/^55/, "")}`} target="_blank" rel="noreferrer">
              {o.customer_phone}
            </a>{" "}
            · {new Date(o.created_at).toLocaleString("pt-BR")}
            {o.status === "received" && <> · reserva até {new Date(o.expires_at).toLocaleString("pt-BR")}</>}
          </p>
          {o.note && <p className="mt-1 text-sm italic text-black/60">“{o.note}”</p>}
          <ul className="mt-3 divide-y divide-black/5 text-sm">
            {o.order_items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-1.5">
                <span>
                  {i.qty}x {i.name} {i.condition && <span className="text-black/45">({i.condition})</span>}
                </span>
                <span>{brl(Number(i.price) * i.qty)}</span>
              </li>
            ))}
          </ul>
          {NEXT[o.status].length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {NEXT[o.status].map(([status, label]) => (
                <form key={status} action={setOrderStatus}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="status" value={status} />
                  <button
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${status === "cancelled" ? "border border-red-200 text-red-700 hover:bg-red-50" : "bg-ink text-white hover:bg-gold-deep"}`}
                  >
                    {label}
                  </button>
                </form>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
