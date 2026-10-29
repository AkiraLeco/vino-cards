import Link from "next/link";

export const metadata = { title: "Minha conta" };

export default function Conta() {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight">Minha conta</h1>
      <p className="mt-3 text-black/60">
        A área do cliente (login e pedidos) ainda está em construção. Em breve você poderá acompanhar seus pedidos por aqui.
      </p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-8 py-3 text-sm font-bold text-white transition hover:bg-gold-deep">
        Voltar para o início
      </Link>
    </div>
  );
}
