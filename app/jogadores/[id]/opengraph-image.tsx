import { ImageResponse } from "next/og";
import { loadPlayerProfile } from "@/lib/load-player-profile";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import {
  buildOgHeatmapWeeks,
  getOgHeatmapColor,
  getOgHeatmapMaxCount,
} from "@/lib/player-og-helpers";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "edge";
export const alt = "Perfil do jogador no Panela Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadPlayerProfile(id);

  if (!data) {
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
            color: "#fafafa",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          Panela Tracker
        </div>
      ),
      { ...size },
    );
  }

  const { player, summary, tags } = data;
  const weeks = buildOgHeatmapWeeks(data.participationDays);
  const maxCount = getOgHeatmapMaxCount(weeks);
  const subtitle = [
    formatPlayerDuration(summary.totalMinutes),
    `${summary.totalSessions} sessões`,
    tags[0],
  ]
    .filter(Boolean)
    .join(" · ");
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
            padding: "40px 48px",
            color: "#09090b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {player.avatar_url ? (
              <img
                src={player.avatar_url}
                alt=""
                width={72}
                height={72}
                style={{
                  borderRadius: "9999px",
                  objectFit: "cover",
                  border: "3px solid #e4e4e7",
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "9999px",
                  background: "#ea580c",
                  color: "#fff7ed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {player.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
                {player.name}
              </div>
              <div style={{ fontSize: 24, color: "#71717a" }}>{subtitle}</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              marginTop: 28,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {weeks.map((week, weekIndex) => (
                <div
                  key={`week-${weekIndex}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {week.map((cell, dayIndex) =>
                    cell.count < 0 ? (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        style={{ width: 12, height: 12 }}
                      />
                    ) : (
                      <div
                        key={`cell-${weekIndex}-${dayIndex}`}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "9999px",
                          background: getOgHeatmapColor(cell.count, maxCount),
                        }}
                      />
                    ),
                  )}
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
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#09090b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fafafa",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              P
            </div>
            <div style={{ fontSize: 20, color: "#a1a1aa" }}>
              {siteHost}/jogadores
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
