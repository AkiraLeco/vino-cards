"use client";

import { setStatus } from "@/app/admin/actions";

const STATUS = { available: "Disponível", reserved: "Reservada", sold: "Vendida" };

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => {
        const f = new FormData();
        f.set("id", id);
        f.set("status", e.target.value);
        setStatus(f);
      }}
      className="rounded bg-black/5 px-2 py-1 text-sm [&>option]:text-black"
    >
      {Object.entries(STATUS).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  );
}
