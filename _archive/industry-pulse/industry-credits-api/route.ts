import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { qualifyIndustryAlert } from "@/lib/scraper/qualify";

/**
 * GET /api/industry-credits — List industry credits (paginated)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const take = Math.min(parseInt(searchParams.get("take") || "50"), 100);
  const skip = parseInt(searchParams.get("skip") || "0");
  const territory = searchParams.get("territory");
  const includeRaw = searchParams.get("raw") === "1";

  const where: Record<string, unknown> = {
    isHidden: false,
    ...(includeRaw ? {} : { alertEligible: true }),
  };
  if (territory) where.agencyTerritory = territory;

  const [credits, total] = await Promise.all([
    prisma.industryCredit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.industryCredit.count({ where }),
  ]);

  return NextResponse.json({ credits, total });
}

/**
 * POST /api/industry-credits — Manually add an industry credit
 * ADMIN and REP roles can add credits from their industry reading.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "PRODUCER", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      brand,
      campaignName,
      agency,
      productionCompany,
      directorName,
      category,
      territory,
      sourceUrl,
      sourceName,
    } = body;

    if (!brand || typeof brand !== "string") {
      return NextResponse.json({ error: "Brand is required" }, { status: 400 });
    }

    // Check for duplicates (same brand + campaign + director in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existing = await prisma.industryCredit.findFirst({
      where: {
        brand: brand.trim(),
        campaignName: campaignName?.trim() || undefined,
        directorName: directorName?.trim() || undefined,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This credit already exists", existingId: existing.id },
        { status: 409 }
      );
    }

    const qualified = qualifyIndustryAlert({
      agency,
      directorName,
      productionCompany,
      sourceName: sourceName?.trim() || "MANUAL",
    });

    const credit = await prisma.industryCredit.create({
      data: {
        brand: brand.trim(),
        campaignName: campaignName?.trim() || null,
        agency: agency?.trim() || null,
        productionCompany: productionCompany?.trim() || null,
        directorName: directorName?.trim() || null,
        agencyCanonical: qualified.agencyCanonical,
        productionCompanyCanonical: qualified.productionCompanyCanonical,
        directorNameCanonical: qualified.directorNameCanonical,
        category: category?.trim() || null,
        territory: territory || null,
        agencyTerritory: qualified.agencyTerritory || null,
        sourceUrl: sourceUrl?.trim() || null,
        sourceName: sourceName?.trim() || "MANUAL",
        sourceTrust: qualified.sourceTrust,
        confidence: qualified.confidence,
        alertEligible: qualified.alertEligible,
        alertRejectedReason: qualified.alertRejectedReason,
        qualifiedAt: qualified.qualifiedAt,
        isVerified: true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json(credit, { status: 201 });
  } catch (err) {
    console.error("[Industry Credits API] Create failed:", err);
    return NextResponse.json({ error: "Failed to create credit" }, { status: 500 });
  }
}
