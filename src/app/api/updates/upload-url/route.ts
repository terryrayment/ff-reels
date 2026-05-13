import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getUploadUrl } from "@/lib/r2/client";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function buildMediaUrl(r2Key: string) {
  return `/api/updates/media?key=${encodeURIComponent(r2Key)}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP", "PRODUCER"].includes(session.user.role)) {
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
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP, and GIF files are allowed" },
      { status: 400 },
    );
  }

  if (typeof sizeBytes === "number" && sizeBytes > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image too large (max 10MB)" },
      { status: 400 },
    );
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uuid = Math.random().toString(36).slice(2, 12);
  const r2Key = `updates/${uuid}/${Date.now()}-${safeName}`;
  const uploadUrl = await getUploadUrl(r2Key, contentType);

  return NextResponse.json({
    uploadUrl,
    r2Key,
    imageUrl: buildMediaUrl(r2Key),
  });
}
