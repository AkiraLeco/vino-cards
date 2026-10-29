import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="font-display text-7xl font-bold text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-black/55">O endereço não existe ou o item não está mais disponível.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-8 py-3 font-semibold text-white transition hover:bg-gold-deep">
        Voltar ao início
      </Link>
    </div>
  );
}
