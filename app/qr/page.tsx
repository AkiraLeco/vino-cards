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
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-gold/30 bg-white p-8 text-center shadow-sm print:border-0 print:shadow-none">
      <h1 className="font-display text-5xl font-bold text-ink">{STORE_NAME}</h1>
      <p className="text-lg text-black/70">Aponte a câmera do celular para ver as cartas</p>
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
          className="rounded-full bg-ink px-6 py-2.5 font-bold text-white transition hover:bg-gold-deep"
        >
          Baixar PNG
        </a>
        <button
          onClick={() => window.print()}
          className="rounded-full border border-black/20 px-6 py-2.5 font-bold transition hover:border-gold hover:bg-violet-50"
        >
          Imprimir
        </button>
      </div>
    </div>
  );
}
