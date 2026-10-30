"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="font-display text-4xl font-bold">Algo deu errado</h1>
      <p className="mt-2 text-black/55">Não foi possível carregar esta página agora. Tente de novo em instantes.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => retry()} className="rounded-full bg-ink px-8 py-3 font-semibold text-white transition hover:bg-gold-deep">
          Tentar de novo
        </button>
        <Link href="/" className="rounded-full border border-black/15 px-8 py-3 font-semibold transition hover:border-gold-deep">
          Início
        </Link>
      </div>
    </div>
  );
}
