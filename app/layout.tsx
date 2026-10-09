import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
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
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6">{children}</div>
          <footer className="bg-[#313131] py-6 text-center text-xs text-white/70">
            {STORE_NAME} · Cartas Pokémon
          </footer>
          {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="fixed bottom-5 right-5 z-50 rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-green-600"
            >
              WhatsApp
            </a>
          )}
        </CartProvider>
      </body>
    </html>
  );
}
