import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-6xl">🔍</p>
      <h1 className="mt-4 text-2xl font-extrabold">Página não encontrada</h1>
      <p className="mt-2 text-black/55">O endereço não existe ou o item não está mais disponível.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-violet-600 px-6 py-2.5 font-semibold text-white hover:bg-violet-700">
        Voltar ao início
      </Link>
    </div>
  );
}
