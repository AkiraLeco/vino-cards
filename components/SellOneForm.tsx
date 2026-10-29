"use client";

import { useActionState } from "react";
import { sellOne } from "@/app/admin/actions";

export default function SellOneForm({ id, disabled }: { id: string; disabled: boolean }) {
  const [error, action, pending] = useActionState(sellOne, null);

  return (
    <form action={action} className="flex flex-col items-start">
      <input type="hidden" name="id" value={id} />
      <button
        disabled={disabled || pending}
        className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-gold-deep disabled:opacity-40"
      >
        {pending ? "..." : "Vendi 1"}
      </button>
      {error && (
        <span role="alert" className="mt-1 max-w-40 text-[11px] text-red-700">
          {error}
        </span>
      )}
    </form>
  );
}
