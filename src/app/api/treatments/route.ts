import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * POST /api/treatments
 * Create a new treatment sample for a director.
 * Body: { directorId, title, previewUrl, brand?, pageCount?, isRedacted? }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "PRODUCER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { directorId, title, previewUrl, brand, pageCount, isRedacted } = body;

  if (!directorId || !title || !previewUrl) {
    return NextResponse.json(
      { error: "directorId, title, and previewUrl are required" },
      { status: 400 }
    );
  }

  const treatment = await prisma.treatmentSample.create({
    data: {
      directorId,
      title,
      previewUrl,
      brand: brand || null,
      pageCount: pageCount || null,
      isRedacted: isRedacted || false,
    },
  });

  return NextResponse.json(treatment, { status: 201 });
}
