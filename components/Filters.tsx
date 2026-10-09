import { CONDITIONS, LANGUAGES } from "@/lib/types";

export interface FilterOptions {
  sets: string[];
  rarities: string[];
}

const field =
  "rounded bg-white px-2 py-1.5 text-sm text-[#313131] outline-none [&>option]:text-black";
const lbl = "flex flex-col gap-1 text-xs text-white/80";

export default function Filters({
  opts,
  values,
}: {
  opts: FilterOptions;
  values: Record<string, string | undefined>;
}) {
  const stockOnly = !values.f || values.stock === "1";
  return (
    <form
      action="/"
      className="flex flex-wrap items-end gap-3 rounded-lg bg-[#313131] p-4 shadow"
    >
      <input type="hidden" name="f" value="1" />
      {values.q && <input type="hidden" name="q" value={values.q} />}
      <label className={lbl}>
        Ordenar
        <select name="sort" defaultValue={values.sort ?? ""} className={field}>
          <option value="">Mais recentes</option>
          <option value="name">Nome [A-Z]</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
        </select>
      </label>
      <label className={lbl}>
        Coleção
        <select name="set" defaultValue={values.set ?? ""} className={`${field} max-w-44`}>
          <option value="">Todas</option>
          {opts.sets.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className={lbl}>
        Raridade
        <select name="rarity" defaultValue={values.rarity ?? ""} className={field}>
          <option value="">Todas</option>
          {opts.rarities.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className={lbl}>
        Estado
        <select name="cond" defaultValue={values.cond ?? ""} className={field}>
          <option value="">Qualquer</option>
          {Object.entries(CONDITIONS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className={lbl}>
        Idioma
        <select name="lang" defaultValue={values.lang ?? ""} className={field}>
          <option value="">Qualquer</option>
          {LANGUAGES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>
      <label className={lbl}>
        Preço (R$)
        <span className="flex gap-1">
          <input name="min" type="number" min="0" defaultValue={values.min} placeholder="mín" className={`${field} w-20`} />
          <input name="max" type="number" min="0" defaultValue={values.max} placeholder="máx" className={`${field} w-20`} />
        </span>
      </label>
      <label className={lbl}>
        Exibir
        <select name="per" defaultValue={values.per ?? "30"} className={field}>
          {[30, 60, 90].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 pb-2 text-sm text-white">
        <input type="checkbox" name="stock" value="1" defaultChecked={stockOnly} />
        Com estoque
      </label>
      <button className="rounded bg-violet-600 px-6 py-2 text-lg font-bold text-white hover:bg-violet-500">
        Filtrar
      </button>
    </form>
  );
}
