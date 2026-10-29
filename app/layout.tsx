import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import SiteShell from "@/components/SiteShell";
import { FLOATING_WHATSAPP } from "@/lib/features";
import { STORE_NAME } from "@/lib/format";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${STORE_NAME} | Cartas, selados e acessórios de Pokémon e Riftbound`,
  description: "Cartas avulsas, produtos selados e acessórios de Pokémon e Riftbound: veja estado, coleção, preço e disponibilidade.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <CartProvider>
          <SiteShell
            footer={
          <footer className="mt-16 bg-ink text-white/70 print:hidden">
            <div className="gold-rule" />
            <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="font-display text-2xl font-semibold tracking-wide text-white">{STORE_NAME}</p>
                <p className="mt-2 text-sm">
                  Cartas, produtos selados e acessórios de Pokémon e Riftbound.
                </p>
              </div>
              <div className="text-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">Atendimento</p>
                <p>Presencial e online. Tire dúvidas e reserve itens com a gente.</p>
              </div>
              <div className="text-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">Contato</p>
                <p>WhatsApp: (11) 90000-0000</p>
                <p className="mt-1">E-mail: contato@vinocards.exemplo</p>
              </div>
              <div className="text-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">Endereço e horário</p>
                <p>Endereço: Rua Exemplo, 123 - Centro, São Paulo/SP</p>
                <p className="mt-1">Horário: Seg a Sáb, 10h às 19h</p>
              </div>
            </div>
            <p className="border-t border-white/10 py-4 text-center text-xs text-white/40">
              © {new Date().getFullYear()} {STORE_NAME}. Projeto independente, sem vínculo com as marcas citadas.
            </p>
          </footer>
            }
            floating={
          FLOATING_WHATSAPP && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="fixed bottom-4 right-4 z-50 print:hidden rounded-full bg-[#1faa59] px-4 py-2.5 text-xs font-bold sm:px-5 sm:py-3 sm:text-sm text-white shadow-xl shadow-black/20 ring-1 ring-white/30 transition hover:bg-[#178a47] hover:-translate-y-0.5"
            >
              WhatsApp
            </a>
          )
            }
          >
            {children}
          </SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
