/** Endereço público do site: NEXT_PUBLIC_SITE_URL, ou o domínio da Vercel, ou localhost. */
export function siteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

/** Dados de contato e textos institucionais (fictícios): troque aqui e vale para o rodapé e a home. */
export const CONTACT = {
  phone: "(11) 90000-0000",
  email: "contato@vinocards.exemplo",
  address: "Rua Exemplo, 123 - Centro, São Paulo/SP",
  hours: "Seg a Sáb, 10h às 19h",
};

export const PERKS = [
  { icon: "✦", title: "Estado transparente", text: "Cada carta com condição, idioma e coleção informados." },
  { icon: "◆", title: "Estoque real", text: "Disponibilidade atualizada a cada venda e reserva." },
  { icon: "❖", title: "Atendimento direto", text: "Dúvidas e reservas pelo WhatsApp, sem burocracia." },
];
