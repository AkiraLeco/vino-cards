import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STORE_NAME } from "@/lib/format";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");

  return (
    <div>
      <nav className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-gold/25 bg-white px-4 py-3 text-sm shadow-sm">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-xl font-bold text-gold-soft ring-1 ring-gold/60">
            V
          </span>
          <span className="font-display text-xl font-semibold tracking-wide">
            {STORE_NAME} <span className="font-medium text-black/50">· Admin</span>
          </span>
        </Link>
        <Link href="/admin" className="ml-2 font-bold">
          Produtos
        </Link>
        <Link href="/admin/nova" className="font-semibold text-gold-deep hover:underline">
          + Novo produto
        </Link>
        <form action={logout} className="ml-auto">
          <button className="text-black/60 hover:text-black">Sair</button>
        </form>
      </nav>
      {children}
    </div>
  );
}
