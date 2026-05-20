/**
 * Build the Versant pitch reel.
 *
 * Idempotent — finds or creates a Reel titled "Friends & Family for Versant"
 * with Terry Rayment as primary director, pulls the top published spot from
 * each of the 12 caddie-card directors (with Mux + thumbnail), and creates a
 * long-lived ScreeningLink with custom branding.
 *
 * Usage:
 *   set -a; source .env; set +a
 *   npx tsx scripts/build-versant-reel.ts
 *
 * Outputs the screening token + URL to stdout. Set the token on Vercel as
 * VERSANT_DEMO_REEL_TOKEN to wire the live page.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REEL_TITLE = "Friends & Family for Versant";
const REEL_BRAND = "Versant Media";
const REEL_AGENCY = "USA Sports";
const REEL_CAMPAIGN = "Production Partnership";
const REEL_PRODUCER = "Terry Rayment";
const REEL_NOTE =
  "Comedy with stakes. Cinematic talent direction. Sport, lifestyle, music, brand. Each piece is here because it proves a register we'd bring to Versant — and to Golf Channel first.";

const SCREENING_WELCOME =
  "A reel built for Versant. About four minutes. Then call us.";
const SCREENING_CTA_LABEL = "Back to the pitch";
const SCREENING_CTA_URL = "https://reels.friendsandfamily.tv/versant";
const SCREENING_EXPIRY_DAYS = 120;

// Director play-order — sets the narrative arc of the reel.
// Anthem opener → emotional → systems → precision → culture → comedy →
// portraits → charm → motion → mixed-media → Americana close → comedy close.
const DIRECTOR_ORDER = [
  "caleb-slain", // Anthem
  "terry-rayment", // Emotional / human
  "james-frost", // Systems & scale
  "kelsey-larkin", // Precision
  "boma-iluma", // Culture / next-gen
  "matt-dilmore", // Sports comedy
  "cody-cloud", // Portraits
  "jack-turits", // Charm / documentary
  "le-ged", // Motion
  "bueno", // Mixed-media comedy
  "brother-willis", // Americana
  "leigh-marling", // Entertainment / brand comedy
];

async function pickTopSpot(directorSlug: string) {
  const director = await prisma.director.findUnique({
    where: { slug: directorSlug },
    select: { id: true, name: true },
  });
  if (!director) {
    console.warn(`  ! director not found: ${directorSlug}`);
    return null;
  }

  // Top published spot — curator-set sortOrder first, must have Mux + thumb.
  const top = await prisma.project.findFirst({
    where: {
      directorId: director.id,
      isPublished: true,
      muxPlaybackId: { not: null },
      thumbnailUrl: { not: null },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, brand: true, year: true, sortOrder: true },
  });
  if (!top) {
    console.warn(
      `  ! no eligible spot for ${director.name} (${directorSlug}) — skipping`,
    );
    return null;
  }
  return { director, project: top };
}

function generateToken(): string {
  // Same shape as the existing generator (cuid-like, URL-safe)
  const part = (n: number) =>
    Array.from(crypto.getRandomValues(new Uint8Array(n)))
      .map((b) => b.toString(36))
      .join("")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, n);
  return `c${part(24)}`;
}

async function main() {
  console.log(`\n▍ Versant reel build — ${new Date().toISOString()}\n`);

  // Primary director — Terry
  const terry = await prisma.director.findUnique({
    where: { slug: "terry-rayment" },
    select: { id: true, name: true },
  });
  if (!terry) {
    throw new Error("Primary director (terry-rayment) not found.");
  }
  console.log(`Primary director: ${terry.name}\n`);

  // Pick top spot for each director in play order
  console.log("Selecting one spot per director:");
  const picks: Array<{ projectId: string; line: string }> = [];
  for (const slug of DIRECTOR_ORDER) {
    const pick = await pickTopSpot(slug);
    if (!pick) continue;
    picks.push({
      projectId: pick.project.id,
      line: `  ${picks.length + 1}. ${pick.director.name.padEnd(18)} — ${pick.project.brand ? `[${pick.project.brand}] ` : ""}${pick.project.title}`,
    });
  }
  picks.forEach((p) => console.log(p.line));
  console.log(`\nTotal spots in reel: ${picks.length}\n`);

  if (picks.length === 0) {
    throw new Error("No spots selected — nothing to build.");
  }

  // Find or create the reel (idempotent by title + brand)
  let reel = await prisma.reel.findFirst({
    where: { title: REEL_TITLE, brand: REEL_BRAND },
    select: { id: true, title: true },
  });

  if (reel) {
    console.log(`Existing reel found (${reel.id}) — clearing items and updating.`);
    await prisma.reelItem.deleteMany({ where: { reelId: reel.id } });
    await prisma.reel.update({
      where: { id: reel.id },
      data: {
        directorId: terry.id,
        description:
          "Built for the Versant pitch. Twelve directors. The cuts we'd hand a network that wanted to see what we're actually good at.",
        curatorialNote: REEL_NOTE,
        agencyName: REEL_AGENCY,
        campaignName: REEL_CAMPAIGN,
        producer: REEL_PRODUCER,
        reelType: "CUSTOM",
      },
    });
  } else {
    reel = await prisma.reel.create({
      data: {
        directorId: terry.id,
        title: REEL_TITLE,
        description:
          "Built for the Versant pitch. Twelve directors. The cuts we'd hand a network that wanted to see what we're actually good at.",
        curatorialNote: REEL_NOTE,
        brand: REEL_BRAND,
        agencyName: REEL_AGENCY,
        campaignName: REEL_CAMPAIGN,
        producer: REEL_PRODUCER,
        reelType: "CUSTOM",
      },
      select: { id: true, title: true },
    });
    console.log(`New reel created (${reel.id}).`);
  }

  // Create reel items in play order
  for (let i = 0; i < picks.length; i++) {
    await prisma.reelItem.create({
      data: {
        reelId: reel.id,
        projectId: picks[i].projectId,
        sortOrder: i,
      },
    });
  }
  console.log(`Inserted ${picks.length} reel items.\n`);

  // Create a fresh screening link (don't disrupt any existing links)
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SCREENING_EXPIRY_DAYS * 86400000);

  const link = await prisma.screeningLink.create({
    data: {
      reelId: reel.id,
      token,
      recipientName: "Versant Media",
      recipientCompany: "Versant Media · USA Sports",
      expiresAt,
      isActive: true,
      customWelcomeMessage: SCREENING_WELCOME,
      ctaUrl: SCREENING_CTA_URL,
      ctaLabel: SCREENING_CTA_LABEL,
    },
    select: { token: true, expiresAt: true },
  });

  const url = `https://reels.friendsandfamily.tv/s/${link.token}`;

  console.log("━".repeat(72));
  console.log("✅ Done.");
  console.log(`   Reel ID:        ${reel.id}`);
  console.log(`   Screening URL:  ${url}`);
  console.log(`   Token:          ${link.token}`);
  console.log(`   Expires:        ${link.expiresAt?.toISOString()}`);
  console.log("");
  console.log("Next:");
  console.log(`   1. Verify: open ${url}`);
  console.log(`   2. Set Vercel env: VERSANT_DEMO_REEL_TOKEN=${link.token}`);
  console.log("   3. Redeploy the ff-reels project.");
  console.log("━".repeat(72));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
