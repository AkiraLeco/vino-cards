"use client";

import { useState } from "react";
import { saveCard } from "@/app/admin/actions";
import { searchTcg, type TcgResult } from "@/lib/pokemontcg";
import { CONDITIONS, LANGUAGES, type Card } from "@/lib/types";

const field = "w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none [&>option]:text-black";
const label = "flex flex-col gap-1 text-xs text-white/70";

export default function CardForm({ card }: { card?: Card }) {
  const [v, setV] = useState({
    api_card_id: card?.api_card_id ?? "",
    name: card?.name ?? "",
    set_name: card?.set_name ?? "",
    number: card?.number ?? "",
    rarity: card?.rarity ?? "",
    image_api_url: card?.image_api_url ?? "",
  });
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TcgResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    setResults(await searchTcg(q).catch(() => []));
    setLoading(false);
  }

  function pick(r: TcgResult) {
    setV({
      api_card_id: r.id,
      name: r.name,
      set_name: r.set.name,
      number: r.number,
      rarity: r.rarity ?? "",
      image_api_url: r.images.large,
    });
    setResults([]);
  }

  const bind = (k: keyof typeof v) => ({
    name: k,
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value }),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="mb-2 text-sm font-semibold">Buscar carta na base Pokémon TCG</p>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Ex: Charizard (nome em inglês)"
            className={field}
          />
          <button type="button" onClick={search} className="rounded-lg bg-yellow-400 px-4 text-sm font-bold text-black">
            {loading ? "..." : "Buscar"}
          </button>
        </div>
        {results.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {results.map((r) => (
              <button type="button" key={r.id} onClick={() => pick(r)} className="text-left text-xs hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.images.small} alt={r.name} className="w-full rounded" />
                <span className="line-clamp-1">{r.set.name} {r.number}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <form action={saveCard} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={card?.id ?? ""} />
        <input type="hidden" name="api_card_id" value={v.api_card_id} />
        <input type="hidden" name="image_api_url" value={v.image_api_url} />
        <input type="hidden" name="existing_photos" value={(card?.photo_urls ?? []).join("\n")} />

        {v.image_api_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.image_api_url} alt="" className="mx-auto h-48 sm:col-span-2" />
        )}

        <label className={`${label} sm:col-span-2`}>
          Nome
          <input required className={field} {...bind("name")} />
        </label>
        <label className={label}>
          Coleção
          <input className={field} {...bind("set_name")} />
        </label>
        <label className={label}>
          Número
          <input className={field} {...bind("number")} />
        </label>
        <label className={label}>
          Raridade
          <input className={field} {...bind("rarity")} />
        </label>
        <label className={label}>
          Idioma
          <select name="language" defaultValue={card?.language ?? "Português"} className={field}>
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Estado
          <select name="condition" defaultValue={card?.condition ?? "NM"} className={field}>
            {Object.entries(CONDITIONS).map(([k, t]) => (
              <option key={k} value={k}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Status
          <select name="status" defaultValue={card?.status ?? "available"} className={field}>
            <option value="available">Disponível</option>
            <option value="reserved">Reservada</option>
            <option value="sold">Vendida</option>
          </select>
        </label>
        <label className={label}>
          Preço (R$)
          <input name="price" type="number" step="0.01" min="0" required defaultValue={card?.price} className={field} />
        </label>
        <label className={label}>
          Preço de referência (R$, opcional)
          <input name="ref_price" type="number" step="0.01" min="0" defaultValue={card?.ref_price ?? ""} className={field} />
        </label>
        <label className={label}>
          Quantidade
          <input name="quantity" type="number" min="0" defaultValue={card?.quantity ?? 1} className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Observações
          <textarea name="notes" rows={3} defaultValue={card?.notes ?? ""} className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Fotos reais da carta
          <input name="photos" type="file" accept="image/*" multiple className={field} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_foil" defaultChecked={card?.is_foil} /> Foil / Holo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={card?.featured} /> Destaque
        </label>
        <button className="rounded-lg bg-yellow-400 py-3 font-bold text-black sm:col-span-2">
          Salvar carta
        </button>
      </form>
    </div>
  );
}
