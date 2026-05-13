import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { R2_BUCKET, r2 } from "@/lib/r2/client";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key || !key.startsWith("updates/")) {
    return NextResponse.json({ error: "Invalid media key" }, { status: 400 });
  }

  try {
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );

    if (!object.Body) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await object.Body.transformToByteArray());

    return new Response(buffer, {
      headers: {
        "Content-Type": object.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Update Media] Failed to load media:", error);
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }
}
