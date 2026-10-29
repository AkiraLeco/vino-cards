"use client";

import { useActionState } from "react";
import { deleteCard } from "@/app/admin/actions";

export default function DeleteCardForm({ id }: { id: string }) {
  const [error, action, pending] = useActionState(deleteCard, null);

  return (
    <form
      action={action}
      className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50/60 p-4"
      onSubmit={(e) => {
        if (!confirm("Excluir este item? Isso não pode ser desfeito.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-red-900">Zona de perigo</p>
          <p className="text-xs text-red-800/80">Excluir remove o item do site definitivamente.</p>
        </div>
        <button
          disabled={pending}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
        >
          {pending ? "Excluindo..." : "Excluir item"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-800">
          {error}
        </p>
      )}
    </form>
  );
}
