import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { generateToken } from "@/lib/utils";

/**
 * POST /api/treatments
 * Create a new treatment sample for a director. Generates a short share token
 * so the treatment is accessible at reels.friendsandfamily.tv/t/{token}.
 * Body: { directorId, title, brand?, pageCount?, isRedacted?,
 *         previewUrl? (InDesign URL), pdfR2Key? (uploaded PDF) }
 * Exactly one of previewUrl or pdfR2Key must be provided.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "PRODUCER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { directorId, title, previewUrl, pdfR2Key, brand, pageCount, isRedacted } = body;

  if (!directorId || !title) {
    return NextResponse.json(
      { error: "directorId and title are required" },
      { status: 400 }
    );
  }

  if (!previewUrl && !pdfR2Key) {
    return NextResponse.json(
      { error: "Either previewUrl or pdfR2Key is required" },
      { status: 400 }
    );
  }

  // Generate unique short token (retry up to 5x on unlikely collision)
  let treatment = null;
  let attempts = 0;
  while (attempts < 5) {
    try {
      treatment = await prisma.treatmentSample.create({
        data: {
          directorId,
          title,
          previewUrl: previewUrl || null,
          pdfR2Key: pdfR2Key || null,
          token: generateToken(),
          brand: brand || null,
          pageCount: pageCount || null,
          isRedacted: isRedacted || false,
        },
      });
      break;
    } catch (err) {
      attempts++;
      if (attempts >= 5) throw err;
    }
  }

  if (!treatment) {
    return NextResponse.json(
      { error: "Failed to create treatment" },
      { status: 500 }
    );
  }

  const base =
    process.env.NEXT_PUBLIC_SCREENING_URL ||
    "https://reels.friendsandfamily.tv";
  const shareUrl = `${base}/t/${treatment.token}`;

  return NextResponse.json({ ...treatment, shareUrl }, { status: 201 });
}
