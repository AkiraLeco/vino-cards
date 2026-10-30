"use client";

import { startTransition, useActionState, useState } from "react";
import { saveCard } from "@/app/admin/actions";
import { fetchLigaPrice, type LigaResult } from "@/app/admin/liga";
import { ligaSearchUrl, type LigaOffer } from "@/lib/liga";
import { brl } from "@/lib/format";
import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { searchTcg, type TcgResult } from "@/lib/pokemontcg";
import { CATEGORIES, CONDITIONS, GAMES, LANGUAGES, type Card } from "@/lib/types";

const field =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-gold [&>option]:text-black";
const label = "flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-black/60";
const section = "rounded-2xl border border-gold/20 bg-white p-4 shadow-sm sm:p-5";
const sectionTitle = "mb-3 flex items-center gap-2 font-display text-xl font-bold";
const num = "grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-gold-soft";

export default function CardForm({ card }: { card?: Card }) {
  const [saveError, formAction, saving] = useActionState(saveCard, null);
  const [v, setV] = useState({
    api_card_id: card?.api_card_id ?? "",
    name: card?.name ?? "",
    set_name: card?.set_name ?? "",
    number: card?.number ?? "",
    rarity: card?.rarity ?? "",
    image_api_url: card?.image_api_url ?? "",
  });
  const [game, setGame] = useState<string>(card?.game ?? "pokemon");
  const [category, setCategory] = useState<string>(card?.category ?? "single");
  const isSingle = category === "single";
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TcgResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(card?.price != null ? String(card.price) : "");
  const [refPrice, setRefPrice] = useState(card?.ref_price != null ? String(card.ref_price) : "");
  const [setCode, setSetCode] = useState("");
  const [liga, setLiga] = useState<LigaResult | null>(null);
  const [ligaLoading, setLigaLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(card?.photo_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  async function uploadPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setPhotoError("");
    const supabase = createClient();
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        const blob = await compressImage(f);
        const path = `${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from("card-photos")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw error;
        added.push(supabase.storage.from("card-photos").getPublicUrl(path).data.publicUrl);
      } catch {
        setPhotoError(`Não consegui enviar "${f.name}".`);
      }
    }
    setPhotos((p) => [...p, ...added]);
    setUploading(false);
  }

  async function lookupPrice() {
    setLigaLoading(true);
    setLiga(null);
    setLiga(await fetchLigaPrice({ name: v.name, number: v.number, setCode }));
    setLigaLoading(false);
  }

  function applyPrice(o: LigaOffer, value: number) {
    setPrice(value.toFixed(2));
    setRefPrice((o.avg || value).toFixed(2));
  }

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
    setSetCode(r.set.ptcgoCode ?? "");
    setLiga(null);
    setResults([]);
  }

  const bind = (k: keyof typeof v) => ({
    name: k,
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value }),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight">
        {card ? "Editar item" : "Novo item"}
      </h1>

      {/* onSubmit em vez de action={...}: o React limparia os campos não controlados quando houver erro de validação. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => formAction(data));
        }}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="id" value={card?.id ?? ""} />
        <input type="hidden" name="game" value={game} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="api_card_id" value={v.api_card_id} />
        <input type="hidden" name="image_api_url" value={v.image_api_url} />
        <input type="hidden" name="photo_urls" value={photos.join("\n")} />

        {/* 1. Tipo */}
        <section className={section}>
          <h2 className={sectionTitle}>
            <span className={num}>1</span> O que você está cadastrando?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>
              Tipo de item
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
                {Object.entries(CATEGORIES).map(([k, t]) => (
                  <option key={k} value={k}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            {category !== "accessory" && (
              <label className={label}>
                Jogo
                <select value={game} onChange={(e) => setGame(e.target.value)} className={field}>
                  {Object.entries(GAMES).map(([k, t]) => (
                    <option key={k} value={k}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {isSingle && game === "pokemon" && (
            <div className="mt-4 rounded-xl bg-violet-50 p-3">
              <p className="mb-2 text-sm font-semibold">Buscar na base Pokémon TCG (preenche os dados)</p>
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
                <button
                  type="button"
                  onClick={search}
                  className="rounded-lg bg-ink px-4 text-sm font-bold text-white hover:bg-gold-deep"
                >
                  {loading ? "..." : "Buscar"}
                </button>
              </div>
              {results.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {results.map((r) => (
                    <button type="button" key={r.id} onClick={() => pick(r)} className="text-left text-xs hover:opacity-80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.images.small} alt={r.name} className="w-full rounded" />
                      <span className="line-clamp-1">
                        {r.set.name} {r.number}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {isSingle && game !== "pokemon" && (
            <p className="mt-4 rounded-xl bg-black/5 p-3 text-sm text-black/70">
              A busca automática existe só para Pokémon. Para {GAMES[game as keyof typeof GAMES]}, preencha os
              dados e envie a foto.
            </p>
          )}
        </section>

        {/* 2. Dados */}
        <section className={section}>
          <h2 className={sectionTitle}>
            <span className={num}>2</span> Dados do item
          </h2>
          {v.image_api_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.image_api_url} alt="" className="mx-auto mb-3 h-44" />
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`${label} sm:col-span-2`}>
              Nome
              <input required className={field} {...bind("name")} />
            </label>
            <label className={label}>
              {isSingle ? "Coleção" : "Coleção / linha (opcional)"}
              <input className={field} {...bind("set_name")} />
            </label>
            {isSingle && (
              <>
                <label className={label}>
                  Número
                  <input className={field} {...bind("number")} />
                </label>
                <label className={label}>
                  Raridade
                  <input className={field} {...bind("rarity")} />
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
              </>
            )}
            {category !== "accessory" && (
              <label className={label}>
                Idioma
                <select name="language" defaultValue={card?.language ?? "Português"} className={field}>
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
            )}
            {isSingle && (
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="is_foil" defaultChecked={card?.is_foil} className="h-4 w-4 accent-[#b08d3c]" />
                Foil / Holo
              </label>
            )}
          </div>
        </section>

        {/* 3. Preço e estoque */}
        <section className={section}>
          <h2 className={sectionTitle}>
            <span className={num}>3</span> Preço e estoque
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>
              Preço (R$)
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={field}
              />
            </label>
            <label className={label}>
              Preço de referência (R$, opcional)
              <input
                name="ref_price"
                type="number"
                step="0.01"
                min="0"
                value={refPrice}
                onChange={(e) => setRefPrice(e.target.value)}
                className={field}
              />
            </label>

            {isSingle && game === "pokemon" && (
              <div className="rounded-xl bg-violet-50 p-3 sm:col-span-2">
                <button
                  type="button"
                  disabled={!v.name || ligaLoading}
                  onClick={lookupPrice}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {ligaLoading ? "Consultando..." : "Ver preço na LigaPokémon"}
                </button>
                {liga?.error && (
                  <p role="alert" className="mt-2 text-sm text-red-700">
                    {liga.error}{" "}
                    <a href={ligaSearchUrl(v.name)} target="_blank" rel="noreferrer" className="font-semibold underline">
                      Abrir busca na Liga
                    </a>{" "}
                    e digite o preço manualmente.
                  </p>
                )}
                {liga && !liga.error && liga.offers.length === 0 && (
                  <p className="mt-2 text-sm text-black/70">
                    Não encontrei essa carta na Liga.{" "}
                    <a href={ligaSearchUrl(v.name)} target="_blank" rel="noreferrer" className="underline">
                      Abrir busca na Liga
                    </a>
                  </p>
                )}
                {liga && liga.offers.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {liga.offers.map((o) => (
                      <li key={o.url} className="rounded-lg bg-white p-2 text-xs ring-1 ring-black/10">
                        <a href={o.url} target="_blank" rel="noreferrer" className="font-semibold underline">
                          {o.name} · {o.edition} #{o.num}
                        </a>
                        {o.avg > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {(
                              [
                                ["Mín", o.min],
                                ["Médio", o.avg],
                                ["Máx", o.max],
                              ] as const
                            ).map(([t, val]) => (
                              <button
                                type="button"
                                key={t}
                                onClick={() => applyPrice(o, val)}
                                className="rounded bg-violet-600 px-2 py-1 font-bold text-white"
                              >
                                {t}: {brl(val)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-black/60">Sem ofertas no momento.</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-[11px] text-black/60">
                  Clique em um valor para preencher o preço (a média vira o preço de referência). Confira
                  se é a coleção e o número certos.
                </p>
              </div>
            )}

            <label className={label}>
              Quantidade
              <input name="quantity" type="number" min="0" defaultValue={card?.quantity ?? 1} className={field} />
              <span className="font-normal text-black/60">Quantidade 0 marca o item como vendido.</span>
            </label>
            <label className={label}>
              Status
              <select name="status" defaultValue={card?.status ?? "available"} className={field}>
                <option value="available">Disponível</option>
                <option value="reserved">Reservada</option>
                <option value="sold">Vendida</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="featured" defaultChecked={card?.featured} className="h-4 w-4 accent-[#b08d3c]" />
              Destaque (aparece primeiro nas listas)
            </label>
          </div>
        </section>

        {/* 4. Fotos */}
        <section className={section}>
          <h2 className={sectionTitle}>
            <span className={num}>4</span> Fotos e observações
          </h2>
          <div className={label}>
            Fotos reais do item
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => {
                uploadPhotos(e.target.files);
                e.target.value = "";
              }}
              className={field}
            />
            {uploading && <span className="text-violet-700">Enviando fotos...</span>}
            {photoError && <span role="alert" className="text-red-700">{photoError}</span>}
            {photos.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {photos.map((u) => (
                  <div key={u} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-24 rounded bg-black/5 object-contain" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((p) => p !== u))}
                      className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white"
                      aria-label="Remover foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className={`${label} mt-3`}>
            Observações
            <textarea name="notes" rows={3} defaultValue={card?.notes ?? ""} className={field} />
          </label>
        </section>

        <div className="sticky bottom-3 z-10">
          {saveError && (
            <p role="alert" className="mb-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
              {saveError}
            </p>
          )}
          <button
            disabled={uploading || saving}
            className="w-full rounded-xl bg-ink py-4 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-ink/20 transition hover:bg-gold-deep disabled:opacity-50"
          >
            {uploading ? "Aguarde o envio das fotos..." : saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
