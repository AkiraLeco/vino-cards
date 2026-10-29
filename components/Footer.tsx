import Link from "next/link";
import { STORE_NAME } from "@/lib/format";
import { CONTACT } from "@/lib/site";

const title = "mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft";
const link = "block py-0.5 transition hover:text-gold-soft";

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="mt-16 bg-ink text-white/70 print:hidden">
      <div className="gold-rule" />
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-3xl font-semibold tracking-wide text-white">{STORE_NAME}</p>
          <p className="mt-2 text-sm">Cartas, produtos selados e acessórios de Pokémon e Riftbound.</p>
          <p className="mt-4 text-sm">Presencial e online. Tire dúvidas e reserve itens com a gente.</p>
        </div>
        <nav aria-label="Rodapé" className="text-sm">
          <p className={title}>Navegar</p>
          <Link href="/pokemon/cartas" className={link}>Pokémon · Cartas</Link>
          <Link href="/pokemon/selados" className={link}>Pokémon · Selados</Link>
          <Link href="/riftbound/cartas" className={link}>Riftbound · Cartas</Link>
          <Link href="/riftbound/selados" className={link}>Riftbound · Selados</Link>
          <Link href="/acessorios" className={link}>Acessórios</Link>
        </nav>
        <div className="text-sm">
          <p className={title}>Contato</p>
          {whatsapp ? (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className={link}>
              WhatsApp: {CONTACT.phone}
            </a>
          ) : (
            <p>WhatsApp: {CONTACT.phone}</p>
          )}
          <p className="mt-1">E-mail: {CONTACT.email}</p>
        </div>
        <div className="text-sm">
          <p className={title}>Endereço e horário</p>
          <p>{CONTACT.address}</p>
          <p className="mt-1">{CONTACT.hours}</p>
          <p className="mt-4 text-xs text-white/50">Pagamento e entrega combinados diretamente com a loja.</p>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {STORE_NAME}. Projeto independente, sem vínculo com as marcas citadas.
      </p>
    </footer>
  );
}
