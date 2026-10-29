"use client";

import Link from "next/link";
import { useState } from "react";
import { CONDITIONS, LANGUAGES } from "@/lib/types";

export interface FilterOptions {
  sets: string[];
  rarities: string[];
}

/** single = cartas avulsas (todos os filtros); sealed = só coleção; other = só ordem e preço */
export type FilterMode = "single" | "sealed" | "other";

const field =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-gold";
const lbl = "flex min-w-0 flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-black/50";

export default function Filters({
  opts,
  values,
  action,
  mode,
}: {
  opts: FilterOptions;
  values: Record<string, string | undefined>;
  action: string;
  mode: FilterMode;
}) {
  const [open, setOpen] = useState(false);
  const stockOnly = !values.f || values.stock === "1";
  const active = ["set", "rarity", "cond", "lang", "min", "max", "sort"].filter(
    (k) => values[k],
  ).length;
  const showSet = mode !== "other";
  const isSingle = mode === "single";

  const labels: Record<string, string> = {
    set: "Coleção",
    rarity: "Raridade",
    cond: "Estado",
    lang: "Idioma",
  };
  const chips = [
    ...["set", "rarity", "cond", "lang"]
      .filter((k) => values[k])
      .map((k) => [k, `${labels[k]}: ${k === "cond" ? (CONDITIONS as Record<string, string>)[values[k]!] ?? values[k] : values[k]}`]),
    ...(values.min || values.max ? [["price", `Preço: ${values.min || "0"} – ${values.max || "∞"}`]] : []),
    ...(values.sort ? [["sort", "Ordem personalizada"]] : []),
  ];
  const without = (key: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(values)) {
      if (!v || k === "page") continue;
      if (key === "price" ? k === "min" || k === "max" : k === key) continue;
      p.set(k, v);
    }
    return `${action}?${p.toString()}`;
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-gold/30 bg-white px-4 py-3 text-left text-sm font-semibold shadow-sm lg:hidden"
        aria-expanded={open}
      >
        <span>
          Filtros
          {active > 0 && (
            <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs text-white">{active}</span>
          )}
        </span>
        <span className="text-black/40">{open ? "▲" : "▼"}</span>
      </button>

      <form
        action={action}
        className={`${open ? "grid" : "hidden"} mt-2 grid-cols-2 gap-3 rounded-2xl border border-gold/20 bg-white p-4 shadow-sm lg:mt-0 lg:flex lg:flex-col lg:items-stretch`}
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
        {showSet && (
          <label className={lbl}>
            Coleção
            <select name="set" defaultValue={values.set ?? ""} className={field}>
              <option value="">Todas</option>
              {opts.sets.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        {isSingle && (
          <>
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
          </>
        )}
        <label className={`${lbl} col-span-2 lg:col-span-1`}>
          Preço (R$)
          <span className="flex gap-2">
            <input name="min" type="number" min="0" defaultValue={values.min} placeholder="mín" className={`${field} min-w-0 flex-1`} />
            <input name="max" type="number" min="0" defaultValue={values.max} placeholder="máx" className={`${field} min-w-0 flex-1`} />
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
        <label className="col-span-2 flex items-center gap-2 text-sm lg:col-span-1">
          <input type="checkbox" name="stock" value="1" defaultChecked={stockOnly} className="h-4 w-4 accent-[#b08d3c]" />
          Esconder vendidas
        </label>
        <div className="col-span-2 flex gap-2 lg:col-span-1">
          <button className="flex-1 rounded-lg bg-ink px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-gold-deep">
            Filtrar
          </button>
          <Link
            href={action}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-black/60 hover:bg-black/5"
          >
            Limpar
          </Link>
        </div>
      </form>

      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
          {chips.map(([k, label]) => (
            <li key={k}>
              <Link
                href={without(k)}
                aria-label={`Remover filtro ${label}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-violet-50 px-3 py-1 text-xs font-medium text-ink transition hover:border-gold hover:bg-violet-100"
              >
                {label} <span aria-hidden className="text-black/40">✕</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
