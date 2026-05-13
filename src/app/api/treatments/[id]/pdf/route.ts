import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { R2_BUCKET, r2 } from "@/lib/r2/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

function getAdobePublicationId(previewUrl: string | null): string | null {
  if (!previewUrl) return null;

  try {
    const url = new URL(previewUrl);
    if (url.hostname !== "indd.adobe.com") return null;

    const match = url.pathname.match(/\/view\/([^/?#]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function loadAdobePdf(previewUrl: string | null) {
  const publicationId = getAdobePublicationId(previewUrl);
  if (!publicationId) return null;

  const manifestRes = await fetch(
    `https://indd.adobe.com/api/v1/getManifestdata?pubId=${publicationId}`,
    { cache: "no-store" },
  );

  if (!manifestRes.ok) return null;

  const manifest = await manifestRes.json();
  const data = manifest.data ?? manifest;
  const activeVersion = manifest.activeVersion ?? 1;
  const documentPdf = data.documentPdf;

  if (typeof documentPdf !== "string" || !documentPdf.endsWith(".pdf")) {
    return null;
  }

  const pdfUrl = `https://indd.adobe.com/view/publication/${publicationId}/${activeVersion}/${documentPdf}`;
  const pdfRes = await fetch(pdfUrl, { cache: "no-store" });

  if (!pdfRes.ok) return null;

  const contentType = pdfRes.headers.get("content-type") ?? "";
  if (!contentType.includes("application/pdf")) return null;

  return Buffer.from(await pdfRes.arrayBuffer());
}

function pdfResponse(buffer: Buffer, title: string, isDownload: boolean) {
  const safeName = title.replace(/[^a-zA-Z0-9._-]/g, "_");
  const disposition = isDownload
    ? `attachment; filename="${safeName}.pdf"`
    : "inline";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
      "Content-Disposition": disposition,
    },
  });
}

/**
 * GET /api/treatments/[id]/pdf
 * Streams a treatment's PDF from R2, or from Adobe's exported PDF for legacy
 * InDesign treatments that have not been backfilled into R2 yet.
 *
 * Public access is scoped to valid treatment ids.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const treatment = await prisma.treatmentSample.findUnique({
    where: { id: params.id },
    select: { pdfR2Key: true, previewUrl: true, title: true },
  });

  if (!treatment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isDownload = req.nextUrl.searchParams.get("download") === "1";

  try {
    if (!treatment.pdfR2Key) {
      const adobePdf = await loadAdobePdf(treatment.previewUrl);

      if (!adobePdf) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return pdfResponse(adobePdf, treatment.title, isDownload);
    }

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
    return pdfResponse(buffer, treatment.title, isDownload);
  } catch (err) {
    console.error("[Treatment PDF] Failed to load:", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
