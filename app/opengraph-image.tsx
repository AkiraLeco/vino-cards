import { ImageResponse } from "next/og";
import { STORE_NAME } from "@/lib/format";

export const alt = `${STORE_NAME} | Cartas, selados e acessórios de Pokémon e Riftbound`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#2a2457 0%,#16132e 60%,#0a0918 100%)",
          color: "#d9bd7a",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 700 }}>{STORE_NAME}</div>
        <div style={{ fontSize: 38, marginTop: 20, color: "#ffffffcc" }}>Pokémon · Riftbound</div>
        <div style={{ fontSize: 30, marginTop: 10, color: "#ffffff99" }}>Cartas · Selados · Acessórios</div>
      </div>
    ),
    size,
  );
}
