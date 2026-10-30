"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

/** Layout da loja (topo, rodapé e WhatsApp). Em /admin nada disso aparece: o admin tem o próprio topo. */
export default function SiteShell({
  children,
  footer,
  floating,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  floating: React.ReactNode;
}) {
  const isAdmin = usePathname().startsWith("/admin");

  if (isAdmin) {
    return (
      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 outline-none sm:py-8">
        {children}
      </main>
    );
  }

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-[100] rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 outline-none sm:py-8">
        {children}
      </main>
      {footer}
      {floating}
    </>
  );
}
