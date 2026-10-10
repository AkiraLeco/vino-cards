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
    return <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:py-8">{children}</div>;
  }

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:py-8">{children}</div>
      {footer}
      {floating}
    </>
  );
}
