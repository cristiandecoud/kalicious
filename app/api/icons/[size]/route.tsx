import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const dim = size === "512" ? 512 : 192;
  const radius = Math.round(dim * 0.22);
  const fontSize = Math.round(dim * 0.52);

  return new ImageResponse(
    (
      <div
        style={{
          width: dim,
          height: dim,
          borderRadius: radius,
          backgroundColor: "#C4502A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontWeight: 700,
          fontSize,
          color: "white",
          letterSpacing: "-2px",
        }}
      >
        K
      </div>
    ),
    { width: dim, height: dim }
  );
}
