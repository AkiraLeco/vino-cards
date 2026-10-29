"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { STORE_NAME } from "@/lib/format";

const input =
  "rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form
      action={action}
      className="mx-auto mt-12 flex max-w-sm flex-col gap-3 rounded-3xl border border-gold/30 bg-white p-8 shadow-xl shadow-ink/5"
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink font-display text-3xl font-bold text-gold-soft ring-1 ring-gold/60">
        V
      </span>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">{STORE_NAME}</p>
      <h1 className="mb-2 text-center font-display text-4xl font-bold">Área do vendedor</h1>
      <label className="sr-only" htmlFor="email">
        E-mail
      </label>
      <input id="email" name="email" type="email" required autoComplete="username" placeholder="E-mail" className={input} />
      <label className="sr-only" htmlFor="password">
        Senha
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Senha"
        className={input}
      />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200">
          {error}
        </p>
      )}
      <button
        disabled={pending}
        className="mt-1 rounded-lg bg-ink py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
