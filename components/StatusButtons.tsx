"use client";

import { useState, useTransition } from "react";
import { setStatus } from "@/app/admin/actions";

const OPTIONS = [
  ["available", "Disponível", "bg-emerald-700"],
  ["reserved", "Reservada", "bg-amber-600"],
  ["sold", "Vendida", "bg-red-700"],
] as const;

export default function StatusButtons({ id, status }: { id: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function pick(next: string) {
    if (next === current) return;
    const previous = current;
    setCurrent(next);
    setError(null);
    start(async () => {
      const f = new FormData();
      f.set("id", id);
      f.set("status", next);
      const result = await setStatus(f);
      if (result) {
        setCurrent(previous);
        setError(result);
      }
    });
  }

  return (
    <div className="flex flex-col items-start">
      <div
        className={`inline-flex overflow-hidden rounded-md ring-1 ring-black/20 ${pending ? "opacity-60" : ""}`}
        role="group"
        aria-label="Status da carta"
      >
        {OPTIONS.map(([value, label, color]) => (
          <button
            key={value}
            type="button"
            onClick={() => pick(value)}
            aria-pressed={current === value}
            className={`px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:text-sm ${
              current === value ? `${color} text-white` : "bg-white text-black/60 hover:bg-black/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <span role="alert" className="mt-1 text-[11px] text-red-700">
          {error}
        </span>
      )}
    </div>
  );
}
