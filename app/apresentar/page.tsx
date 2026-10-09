import Presenter from "@/components/Presenter";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Apresentar() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("status", "available")
    .gt("quantity", 0)
    .order("price", { ascending: false });
  return <Presenter cards={(data ?? []) as Card[]} />;
}
