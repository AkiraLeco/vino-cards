"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createOrder } from "./actions";
import CardImage from "@/components/CardImage";
import { useCart } from "@/components/CartProvider";
import { WHATSAPP_ORDER } from "@/lib/features";
import { brl } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";

const step =
  "grid h-8 w-8 place-items-center rounded-full border border-black/10 text-base transition hover:border-gold hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-30";

export default function CartPage() {
  const { lines, setQty, remove, clear, refresh } = useCart();
  // Ao abrir o carrinho, atualiza preços e estoque (itens vendidos saem sozinhos).
  const hasLines = lines.length > 0;
  useEffect(() => {
    if (hasLines) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLines]);
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createOrder({ ...form, items: lines.map((l) => ({ id: l.id, qty: l.qty })) });
    if (res.ok) {
      const url = whatsappUrl(lines, window.location.origin, res.number);
      clear();
      window.location.href = url; // mesma aba: celulares costumam bloquear pop-up aberto após uma espera
      return;
    }
    if (res.unavailable) {
      // Banco sem a tabela de pedidos: mantém o envio simples pelo WhatsApp.
      window.location.href = whatsappUrl(lines, window.location.origin);
      return;
    }
    setError(res.error);
    setBusy(false);
    void refresh();
  }

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const units = lines.reduce((s, l) => s + l.qty, 0);

  if (lines.length === 0)
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-dashed border-gold/40 bg-white px-6 py-16 text-center">
        <p className="font-display text-6xl text-gold">♦</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Seu carrinho está vazio</h1>
        <p className="mb-6 mt-2 text-sm text-black/60">Explore o catálogo e adicione suas cartas favoritas.</p>
        <Link href="/" className="rounded-full bg-ink px-8 py-3 text-sm font-bold text-white transition hover:bg-gold-deep">
          Ver itens
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 border-b border-gold/30 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">Seu pedido</p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Carrinho</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              <Link href={`/cartas/${l.id}`} className="relative h-24 w-[4.5rem] shrink-0 rounded-md bg-violet-50 sm:h-28 sm:w-20">
                {l.image && (
                  <CardImage src={l.image} alt={l.name} sizes="80px" className="rounded-md object-contain p-1" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/cartas/${l.id}`} className="line-clamp-2 font-semibold leading-snug hover:text-gold-deep">
                  {l.name}
                </Link>
                <p className="mt-0.5 text-xs text-black/60">
                  {l.condition} · {brl(l.price)} cada
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" className={step} onClick={() => setQty(l.id, l.qty - 1)} aria-label={`Diminuir ${l.name}`}>
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold" aria-live="polite">
                    {l.qty}
                  </span>
                  <button
                    type="button"
                    className={step}
                    disabled={l.max != null && l.qty >= l.max}
                    onClick={() => setQty(l.id, l.qty + 1)}
                    aria-label={`Aumentar ${l.name}`}
                  >
                    +
                  </button>
                  {l.max != null && l.qty >= l.max && <span className="text-[11px] text-black/60">máx. em estoque</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-display text-2xl font-bold">{brl(l.price * l.qty)}</span>
                <button onClick={() => remove(l.id)} className="text-xs text-black/60 underline-offset-2 hover:text-red-700 hover:underline">
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="rounded-2xl border border-gold/30 bg-white p-5 shadow-lg shadow-ink/5 lg:sticky lg:top-24">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">Resumo</h2>
          <div className="mt-3 flex justify-between text-sm text-black/60">
            <span>
              {units} {units === 1 ? "unidade" : "unidades"}
            </span>
            <span>{brl(total)}</span>
          </div>
          <div className="gold-rule my-4" />
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-display text-4xl font-bold">{brl(total)}</span>
          </div>
          {WHATSAPP_ORDER ? (
            <form onSubmit={submit} className="mt-5 flex flex-col gap-2.5">
              <input
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="WhatsApp com DDD"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
              <textarea
                maxLength={500}
                rows={2}
                placeholder="Observação (opcional)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-2.5 text-sm text-red-800">
                  {error}
                </p>
              )}
              <button
                disabled={busy}
                className="rounded-xl bg-[#15803d] py-3.5 text-center text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-black/10 transition hover:bg-[#12733a] disabled:opacity-60"
              >
                {busy ? "Enviando..." : "Enviar pedido pelo WhatsApp"}
              </button>
              <p className="text-center text-xs text-black/60">Os itens ficam reservados para você por 48 horas.</p>
            </form>
          ) : (
            <p className="mt-5 rounded-xl bg-black/5 py-3 text-center text-sm text-black/60">
              O envio de pedidos está indisponível no momento.
            </p>
          )}
          <p className="mt-3 text-center text-xs text-black/60">Pagamento e entrega combinados diretamente com a loja.</p>
          <button
            onClick={() => {
              if (window.confirm("Esvaziar o carrinho?")) clear();
            }}
            className="mt-3 w-full text-sm text-black/60 hover:text-black"
          >
            Esvaziar carrinho
          </button>
        </aside>
      </div>
    </div>
  );
}
