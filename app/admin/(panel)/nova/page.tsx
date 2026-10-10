import CardForm from "@/components/CardForm";

import { requireAdmin } from "@/lib/auth";

export default async function NovaCarta() {
  await requireAdmin();
  return <CardForm />;
}
