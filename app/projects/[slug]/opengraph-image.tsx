import { ImageResponse } from "next/og";
import { getProjectMeta } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";

export const alt = "Project case study on rohansingh04.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// brand palette from globals.css (dark theme)
const bg = "#0a0a0a";
const surface = "#141414";
const fg = "#fafaf9";
const accent = "#6baa7a";
const border = "#262626";
const muted = "#a3a3a3";

const statusLabel = {
  "in-progress": "still working on this",
  shipped: "finished for now",
  archived: "older project",
} as const;

const outerStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  padding: 36,
  background: `radial-gradient(circle at 12% 0%, ${accent}26 0, ${accent}00 42%), ${bg}`,
  fontFamily: "sans-serif",
} as const;

const frameStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between" as const,
  padding: "52px 62px",
  border: `1px solid ${border}`,
  borderRadius: 28,
};

const eyebrowRowStyle = { display: "flex", alignItems: "center", gap: 16 } as const;
const eyebrowDotStyle = { width: 13, height: 13, borderRadius: 999, background: accent } as const;
const eyebrowTextStyle = {
  fontSize: 21,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: muted,
} as const;

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getProjectMeta(slug);

  if (!meta) {
    return new ImageResponse(
      (
        <div style={outerStyle}>
          <div style={frameStyle}>
            <div style={eyebrowRowStyle}>
              <div style={eyebrowDotStyle} />
              <div style={eyebrowTextStyle}>rohansingh04.com / projects</div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 650,
                letterSpacing: "-0.035em",
                color: fg,
              }}
            >
              Projects by Rohan Singh
            </div>
            <div style={{ display: "flex", fontSize: 26, color: muted }}>
              things I actually wanted to use
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const proof = meta.proofPoints.slice(0, 2);
  const tags = meta.tags.slice(0, 4);

  return new ImageResponse(
    (
      <div style={outerStyle}>
        <div style={frameStyle}>
          <div style={eyebrowRowStyle}>
            <div style={eyebrowDotStyle} />
            <div style={eyebrowTextStyle}>rohansingh04.com / projects</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "flex",
                fontSize: 68,
                fontWeight: 650,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                color: fg,
              }}
            >
              {meta.title}
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 950,
                fontSize: 27,
                lineHeight: 1.35,
                color: muted,
              }}
            >
              {meta.tagline}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 6,
              }}
            >
              {proof.map((point) => (
                <div
                  key={point}
                  style={{ display: "flex", alignItems: "center", gap: 14 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: accent,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      maxWidth: 940,
                      fontSize: 23,
                      lineHeight: 1.3,
                      color: fg,
                    }}
                  >
                    {point}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "8px 15px",
                    border: `1px solid ${border}`,
                    borderRadius: 999,
                    background: surface,
                    fontSize: 17,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: muted,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", fontSize: 19, color: accent }}>
                {statusLabel[meta.status]}
              </div>
              <div style={{ display: "flex", fontSize: 19, color: muted }}>
                · {formatDateRange(meta.startDate, meta.endDate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
