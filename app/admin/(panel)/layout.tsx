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
      <nav className="mb-6 flex items-center gap-4 rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm shadow-sm">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-base font-black text-white">
            V
          </span>
          <span className="font-extrabold">
            {STORE_NAME} <span className="font-medium text-black/50">· Admin</span>
          </span>
        </Link>
        <Link href="/admin" className="ml-2 font-bold">
          Produtos
        </Link>
        <Link href="/admin/nova" className="text-violet-700">
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
