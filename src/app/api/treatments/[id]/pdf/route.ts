import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { R2_BUCKET, r2 } from "@/lib/r2/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

/**
 * GET /api/treatments/[id]/pdf
 * Streams a treatment's PDF from R2.
 *
 * Public access (the treatment page embeds this); access is scoped to treatments
 * that actually have a pdfR2Key — no other gating beyond valid id + matching key.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const treatment = await prisma.treatmentSample.findUnique({
    where: { id: params.id },
    select: { pdfR2Key: true },
  });

  if (!treatment || !treatment.pdfR2Key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: treatment.pdfR2Key,
      }),
    );

    if (!object.Body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await object.Body.transformToByteArray());

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": "inline",
      },
    });
  } catch (err) {
    console.error("[Treatment PDF] Failed to load:", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
