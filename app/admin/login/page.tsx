"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mx-auto mt-16 flex max-w-sm flex-col gap-3">
      <h1 className="text-2xl font-extrabold">Área do vendedor</h1>
      <input
        name="email"
        type="email"
        required
        placeholder="E-mail"
        className="rounded-lg bg-black/5 px-3 py-2"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Senha"
        className="rounded-lg bg-black/5 px-3 py-2"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        disabled={pending}
        className="rounded-lg bg-violet-700 py-2 font-bold text-white disabled:opacity-50"
      >
        Entrar
      </button>
    </form>
  );
}
