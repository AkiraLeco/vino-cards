import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
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

export const metadata: Metadata = {
  title: `${STORE_NAME} | Cartas Pokémon`,
  description: "Cartas Pokémon à venda: veja estado, coleção e preço.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <CartProvider>
          <Header />
          <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:py-8">{children}</div>
          <footer className="mt-10 bg-slate-900 text-white/70 print:hidden">
            <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:grid-cols-3">
              <div>
                <p className="text-lg font-extrabold text-white">{STORE_NAME}</p>
                <p className="mt-2 text-sm">
                  Cartas, produtos selados e acessórios de Pokémon e Riftbound.
                </p>
              </div>
              <div className="text-sm">
                <p className="mb-2 font-semibold text-white">Navegar</p>
                <ul className="space-y-1.5">
                  <li><Link href="/pokemon/cartas" className="hover:text-white">Pokémon</Link></li>
                  <li><Link href="/riftbound/cartas" className="hover:text-white">Riftbound</Link></li>
                  <li><Link href="/acessorios" className="hover:text-white">Acessórios</Link></li>
                </ul>
              </div>
              <div className="text-sm">
                <p className="mb-2 font-semibold text-white">Compartilhe</p>
                <ul className="space-y-1.5">
                  <li><Link href="/qr" className="hover:text-white">QR Code da loja</Link></li>
                  <li><Link href="/carrinho" className="hover:text-white">Meu carrinho</Link></li>
                </ul>
              </div>
            </div>
            <p className="border-t border-white/10 py-4 text-center text-xs text-white/40">
              © {new Date().getFullYear()} {STORE_NAME}. Projeto independente, sem vínculo com as marcas citadas.
            </p>
          </footer>
          {FLOATING_WHATSAPP && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="fixed bottom-4 right-4 z-50 print:hidden rounded-full bg-green-500 px-4 py-2.5 text-xs font-bold sm:px-5 sm:py-3 sm:text-sm text-white shadow-lg hover:bg-green-600"
            >
              WhatsApp
            </a>
          )}
        </CartProvider>
      </body>
    </html>
  );
}
