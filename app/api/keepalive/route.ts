import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Chamado diariamente pelo cron da Vercel para o Supabase gratuito não pausar por inatividade.
export async function GET(request: Request) {
  // A Vercel envia "Authorization: Bearer $CRON_SECRET" quando a variável existe no projeto.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Não autorizado", { status: 401 });
  }
  const supabase = await createClient();
  const { error } = await supabase.from("cards").select("id").limit(1);
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}
