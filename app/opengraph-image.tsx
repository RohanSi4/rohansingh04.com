import { ImageResponse } from "next/og";

export const alt = "Rohan Singh: projects, running, and more";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// brand palette from globals.css (dark theme)
const bg = "#0a0a0a";
const fg = "#fafaf9";
const accent = "#6baa7a";
const accentDim = "#5a9468";
const border = "#262626";
const muted = "#a3a3a3";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 36,
          background: `radial-gradient(circle at 12% 0%, ${accent}26 0, ${accent}00 42%), radial-gradient(circle at 95% 105%, #f2765518 0, #f2765500 30%), ${bg}`,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 66px",
            border: `1px solid ${border}`,
            borderRadius: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: 999,
                background: accent,
              }}
            />
            <div
              style={{
                fontSize: 22,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: muted,
              }}
            >
              Rohan Singh · rohansingh04.com
            </div>
          </div>

          <div
            style={{
              display: "flex",
              maxWidth: 980,
              fontSize: 76,
              fontWeight: 650,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              color: fg,
            }}
          >
            I like making things I actually want to use.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 26, color: muted }}>projects</div>
            <div style={{ display: "flex", fontSize: 26, color: accentDim }}>·</div>
            <div style={{ display: "flex", fontSize: 26, color: muted }}>running</div>
            <div style={{ display: "flex", fontSize: 26, color: accentDim }}>·</div>
            <div style={{ display: "flex", fontSize: 26, color: muted }}>travel</div>
            <div style={{ display: "flex", fontSize: 26, color: accentDim }}>·</div>
            <div style={{ display: "flex", fontSize: 26, color: muted }}>
              whatever I&apos;m into right now
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
