"use client";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "5rem 1rem" }}>
        <h1>Algo deu errado</h1>
        <p>Não foi possível carregar o site agora. Tente de novo em instantes.</p>
        <button onClick={() => retry()} style={{ padding: "0.75rem 2rem", borderRadius: 999, border: 0, background: "#1a1a1a", color: "#fff", fontWeight: 600 }}>
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
