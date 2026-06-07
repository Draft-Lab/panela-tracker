import { ImageResponse } from "next/og";
import { getSiteUrl } from "@/lib/site-url";

export const alt = "Perfil do jogador no Panela Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEATMAP_PATTERN = [
  [0, 1, 0, 2, 1, 0, 1],
  [1, 2, 3, 2, 1, 0, 0],
  [0, 1, 2, 4, 3, 2, 1],
  [1, 0, 1, 2, 3, 2, 0],
  [2, 1, 0, 1, 2, 1, 0],
  [0, 1, 2, 1, 0, 1, 2],
];

const HEATMAP_COLORS = ["#e4e4e7", "#fed7aa", "#fdba74", "#fb923c", "#ea580c"];

function getHeatmapColor(level: number): string {
  return HEATMAP_COLORS[level] ?? HEATMAP_COLORS[0];
}

export default function Image() {
  const siteHost = new URL(getSiteUrl()).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "#fafafa",
            borderRadius: 24,
            padding: "48px 56px",
            color: "#09090b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "9999px",
                background: "#ea580c",
                color: "#fff7ed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              P
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.05 }}>
                Perfil do jogador
              </div>
              <div style={{ fontSize: 28, color: "#71717a" }}>
                Estatísticas, jogos e sessões no Panela Tracker
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              marginTop: 32,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              {HEATMAP_PATTERN.map((week, weekIndex) => (
                <div
                  key={`week-${weekIndex}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {week.map((level, dayIndex) => (
                    <div
                      key={`cell-${weekIndex}-${dayIndex}`}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "9999px",
                        background: getHeatmapColor(level),
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700 }}>Panela Tracker</div>
            <div style={{ fontSize: 22, color: "#a1a1aa" }}>{siteHost}/jogadores</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
