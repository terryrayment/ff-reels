import { NextRequest, NextResponse } from "next/server";
import { r2, R2_BUCKET } from "@/lib/r2/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

/**
 * GET /api/gallery/[directorId]/[filename]?key=gallery/...
 * Proxy an R2 gallery image with long cache headers.
 */
export async function GET(
  req: NextRequest,
) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key || !key.startsWith("gallery/")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    const obj = await r2.send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    );

    if (!obj.Body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bytes = await obj.Body.transformToByteArray();

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": obj.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
