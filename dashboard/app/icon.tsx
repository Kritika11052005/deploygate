import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 18,
          background: "#14161C",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontWeight: 800,
          borderRadius: 8,
          border: "2px solid #7C6CF0",
          color: "#EDEEF2",
          position: "relative",
        }}
      >
        {/* Monogram "D" in Indigo, "G" in White */}
        <span style={{ color: "#7C6CF0" }}>D</span>
        <span style={{ color: "#EDEEF2" }}>G</span>

        {/* Live status dot */}
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#2FB170",
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
