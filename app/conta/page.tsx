import Link from "next/link";

export const metadata = { title: "Minha conta" };

export default function Conta() {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight">Minha conta</h1>
      <p className="mt-3 text-black/60">
        A área do cliente (login e pedidos) ainda está em construção. Em breve você poderá acompanhar seus pedidos por aqui.
      </p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-700">
        Voltar para o início
      </Link>
    </div>
  );
}
