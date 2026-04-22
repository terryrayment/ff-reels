import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getUploadUrl } from "@/lib/r2/client";

const MAX_PDF_BYTES = 100 * 1024 * 1024; // 100MB

/**
 * POST /api/treatments/upload-url
 * Returns a presigned R2 PUT URL for client-side PDF upload.
 * Body: { filename, contentType, sizeBytes }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "PRODUCER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { filename, contentType, sizeBytes } = body as {
    filename?: string;
    contentType?: string;
    sizeBytes?: number;
  };

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }

  if (contentType !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are allowed" },
      { status: 400 }
    );
  }

  if (typeof sizeBytes === "number" && sizeBytes > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: `PDF too large (max ${MAX_PDF_BYTES / 1024 / 1024}MB)` },
      { status: 400 }
    );
  }

  // Build R2 key: treatments/<cuid-ish>/<timestamp>-<filename>
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uuid = Math.random().toString(36).slice(2, 12);
  const r2Key = `treatments/${uuid}/${Date.now()}-${safeName}`;

  const uploadUrl = await getUploadUrl(r2Key, contentType);

  return NextResponse.json({ uploadUrl, r2Key });
}
