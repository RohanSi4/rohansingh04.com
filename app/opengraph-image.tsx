import { ImageResponse } from "next/og";

export const alt =
  "Rohan Singh — software, data, and real-world systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 82px",
          color: "#f4f0e8",
          background:
            "radial-gradient(circle at 86% 12%, #b84e28 0, #b84e2800 35%), linear-gradient(135deg, #171614 0%, #25211d 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#e66c3a",
            }}
          />
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#d7cdc0",
            }}
          >
            Rohan Singh · Portfolio
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 960,
              fontSize: 72,
              fontWeight: 650,
              lineHeight: 1.03,
              letterSpacing: "-0.045em",
            }}
          >
            I build useful software from messy, real-world data.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 27,
              color: "#c5b9aa",
            }}
          >
            Software · data · machine learning · systems with a life outside the demo
          </div>
        </div>
      </div>
    ),
    size
  );
}
