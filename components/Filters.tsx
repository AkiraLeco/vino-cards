import { CONDITIONS, LANGUAGES } from "@/lib/types";

export interface FilterOptions {
  sets: string[];
  rarities: string[];
}

const field =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none [&>option]:text-black";

export default function Filters({
  opts,
  values,
}: {
  opts: FilterOptions;
  values: Record<string, string | undefined>;
}) {
  return (
    <form action="/" className="flex flex-col gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <input name="q" defaultValue={values.q} placeholder="Nome da carta" className={field} />
      <select name="set" defaultValue={values.set ?? ""} className={field}>
        <option value="">Todas as coleções</option>
        {opts.sets.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select name="rarity" defaultValue={values.rarity ?? ""} className={field}>
        <option value="">Todas as raridades</option>
        {opts.rarities.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select name="cond" defaultValue={values.cond ?? ""} className={field}>
        <option value="">Qualquer estado</option>
        {Object.entries(CONDITIONS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <select name="lang" defaultValue={values.lang ?? ""} className={field}>
        <option value="">Qualquer idioma</option>
        {LANGUAGES.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <input name="min" type="number" min="0" defaultValue={values.min} placeholder="R$ mín" className={field} />
        <input name="max" type="number" min="0" defaultValue={values.max} placeholder="R$ máx" className={field} />
      </div>
      <select name="sort" defaultValue={values.sort ?? ""} className={field}>
        <option value="">Mais recentes</option>
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
        <option value="name">Nome (A-Z)</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="all" value="1" defaultChecked={values.all === "1"} />
        Mostrar vendidas/reservadas
      </label>
      <div className="flex gap-2">
        <button className="flex-1 rounded-lg bg-yellow-400 py-2 text-sm font-bold text-black">
          Filtrar
        </button>
        <a href="/" className="rounded-lg bg-white/10 px-4 py-2 text-sm">
          Limpar
        </a>
      </div>
    </form>
  );
}
