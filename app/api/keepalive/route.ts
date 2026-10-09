import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Chamado diariamente pelo cron da Vercel para o Supabase gratuito não pausar por inatividade.
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("cards").select("id").limit(1);
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}
