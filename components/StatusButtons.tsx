"use client";

import { useState, useTransition } from "react";
import { setStatus } from "@/app/admin/actions";

const OPTIONS = [
  ["available", "Disponível", "bg-green-600"],
  ["reserved", "Reservada", "bg-amber-500"],
  ["sold", "Vendida", "bg-red-600"],
] as const;

export default function StatusButtons({ id, status }: { id: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [pending, start] = useTransition();

  function pick(next: string) {
    if (next === current) return;
    setCurrent(next);
    start(async () => {
      const f = new FormData();
      f.set("id", id);
      f.set("status", next);
      await setStatus(f);
    });
  }

  return (
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
  );
}
