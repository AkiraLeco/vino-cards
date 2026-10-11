"use client";

import { deleteCard } from "@/app/admin/actions";

export default function DeleteCardForm({ id }: { id: string }) {
  return (
    <form
      action={deleteCard}
      className="mx-auto mt-4 max-w-2xl"
      onSubmit={(e) => {
        if (!confirm("Excluir este item? Isso não pode ser desfeito.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-sm text-red-400 hover:underline">Excluir carta</button>
    </form>
  );
}
