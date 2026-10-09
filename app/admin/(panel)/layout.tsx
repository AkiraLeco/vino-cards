import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");

  return (
    <div>
      <nav className="mb-6 flex items-center gap-4 border-b border-white/10 pb-3 text-sm">
        <Link href="/admin" className="font-bold">
          Minhas cartas
        </Link>
        <Link href="/admin/nova" className="text-yellow-400">
          + Nova carta
        </Link>
        <form action={logout} className="ml-auto">
          <button className="text-white/60 hover:text-white">Sair</button>
        </form>
      </nav>
      {children}
    </div>
  );
}
