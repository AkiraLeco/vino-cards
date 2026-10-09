"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { STORE_NAME } from "@/lib/format";

export default function QrPage() {
  const [qr, setQr] = useState<{ url: string; png: string } | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M" }).then((png) =>
      setQr({ url, png }),
    );
  }, []);

  const png = qr?.png ?? "";
  const url = qr?.url ?? "";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-6 text-center">
      <h1 className="text-3xl font-extrabold text-violet-700">{STORE_NAME}</h1>
      <p className="text-lg">Aponte a câmera do celular para ver as cartas</p>
      {png ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={png} alt={`QR code para ${url}`} className="w-72 max-w-full rounded-lg shadow sm:w-80" />
      ) : (
        <div className="h-72 w-72 animate-pulse rounded-lg bg-black/5" />
      )}
      <p className="text-sm text-black/60 break-all">{url.replace(/^https?:\/\//, "")}</p>
      <div className="flex gap-3 print:hidden">
        <a
          href={png}
          download="qrcode-loja.png"
          className="rounded-md bg-violet-700 px-5 py-2 font-bold text-white hover:bg-violet-800"
        >
          Baixar PNG
        </a>
        <button
          onClick={() => window.print()}
          className="rounded-md border border-black/20 px-5 py-2 font-bold hover:bg-black/5"
        >
          Imprimir
        </button>
      </div>
    </div>
  );
}
