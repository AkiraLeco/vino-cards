"use client";

import Link from "next/link";
import { useState } from "react";
import { CONDITIONS, LANGUAGES } from "@/lib/types";

export interface FilterOptions {
  sets: string[];
  rarities: string[];
}

const field =
  "w-full rounded bg-white px-2 py-2 text-sm text-[#313131] outline-none lg:w-auto lg:py-1.5 [&>option]:text-black";
const lbl = "flex min-w-0 flex-col gap-1 text-xs text-white/80";

export default function Filters({
  opts,
  values,
}: {
  opts: FilterOptions;
  values: Record<string, string | undefined>;
}) {
  const [open, setOpen] = useState(false);
  const stockOnly = !values.f || values.stock === "1";
  const active = ["set", "rarity", "cond", "lang", "min", "max", "sort"].filter(
    (k) => values[k],
  ).length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg bg-[#313131] px-4 py-3 text-left font-semibold text-white lg:hidden"
        aria-expanded={open}
      >
        <span>
          Filtros{active > 0 && <span className="ml-2 rounded-full bg-violet-600 px-2 text-xs">{active}</span>}
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      <form
        action="/"
        className={`${open ? "grid" : "hidden"} grid-cols-2 gap-3 rounded-b-lg bg-[#313131] p-4 lg:flex lg:flex-wrap lg:items-end lg:rounded-lg lg:shadow`}
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
          <select name="set" defaultValue={values.set ?? ""} className={`${field} lg:max-w-44`}>
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
          Exibir
          <select name="per" defaultValue={values.per ?? "30"} className={field}>
            {[30, 60, 90].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className={`${lbl} col-span-2 lg:col-span-1`}>
          Preço (R$)
          <span className="flex gap-2">
            <input name="min" type="number" min="0" defaultValue={values.min} placeholder="mín" className={`${field} lg:w-20`} />
            <input name="max" type="number" min="0" defaultValue={values.max} placeholder="máx" className={`${field} lg:w-20`} />
          </span>
        </label>
        <label className="col-span-2 flex items-center gap-2 text-sm text-white lg:col-span-1 lg:pb-2">
          <input type="checkbox" name="stock" value="1" defaultChecked={stockOnly} className="h-4 w-4" />
          Com estoque
        </label>
        <div className="col-span-2 flex gap-2 lg:col-span-1">
          <button className="flex-1 rounded bg-violet-600 px-6 py-2 text-lg font-bold text-white hover:bg-violet-500">
            Filtrar
          </button>
          <Link href="/" className="rounded bg-white/10 px-4 py-2 text-sm text-white lg:hidden">
            Limpar
          </Link>
        </div>
      </form>
    </div>
  );
}
