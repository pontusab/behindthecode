import { ImageResponse } from "next/og";

export const alt = "Behind The Code";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 112,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              lineHeight: 0.86,
              whiteSpace: "nowrap",
            }}
          >
            Behind the code
          </div>
        </div>
      </div>
    ),
    size,
  );
}
