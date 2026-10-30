import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Footer from "@/components/Footer";
import SiteShell from "@/components/SiteShell";
import { FLOATING_WHATSAPP } from "@/lib/features";
import { STORE_NAME } from "@/lib/format";
import { siteUrl } from "@/lib/site";

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
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${STORE_NAME} | Cartas, selados e acessórios de Pokémon e Riftbound`,
    template: `%s | ${STORE_NAME}`,
  },
  openGraph: { siteName: STORE_NAME, type: "website", locale: "pt_BR" },
  twitter: { card: "summary_large_image" },
  description: "Cartas avulsas, produtos selados e acessórios de Pokémon e Riftbound: veja estado, coleção, preço e disponibilidade.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <CartProvider>
          <SiteShell
            footer={
            <Footer />
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
