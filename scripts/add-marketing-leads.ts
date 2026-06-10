import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Lead = {
  company: string;
  name: string;
  title: string;
  email: string;
  linkedin?: string;
  source: string;
  tier: "confirmed" | "weak";
};

const LEADS: Lead[] = [
  { company: "Castelion", name: "Leslie Sanchez", title: "VP, Marketing & Comms", email: "leslie@castelion.com", linkedin: "linkedin.com/in/lesliesanchez", source: "TipRanks press release", tier: "confirmed" },
  { company: "Varda Space", name: "Alex Pearlman", title: "Head of Marketing & Comms", email: "alex@varda.com", source: "TheOrg leadership listing", tier: "confirmed" },
  { company: "Shield AI", name: "Chandra Rangan", title: "Chief Marketing Officer", email: "chandra.rangan@shield.ai", source: "shield.ai/company-executives", tier: "confirmed" },
  { company: "Epirus", name: "Alex Moore", title: "VP, Marketing & Comms", email: "alex.moore@epirusinc.com", source: "Epirus leadership page", tier: "confirmed" },
  { company: "Slingshot Aerospace", name: "Kelli Furrer", title: "CRO / CMO", email: "kelli.furrer@slingshotaerospace.com", linkedin: "linkedin.com/in/kellifurrer", source: "GovConWire 2024 hire announcement", tier: "confirmed" },
  { company: "Fly By Jing", name: "Cindy Hofbauer", title: "Head of Marketing", email: "cindy@flybyjing.com", linkedin: "linkedin.com/in/cindy-hofbauer-678a9817", source: "LinkedIn / RocketReach", tier: "confirmed" },
  { company: "MERIT Beauty", name: "Aila Morin", title: "Chief Marketing Officer", email: "aila@meritbeauty.com", linkedin: "linkedin.com/in/ailamorin", source: "CEW + Russh promotion coverage", tier: "confirmed" },
  { company: "Topicals", name: "Abiola Babarinde", title: "Head of Brand Marketing", email: "abiola@mytopicals.com", linkedin: "uk.linkedin.com/in/abiolab", source: "Diary Directory + Fashion Monitor", tier: "confirmed" },
  { company: "Seed Health", name: "Anisha Raghavan", title: "Chief Marketing Officer", email: "anisha@seed.com", source: "PRNewswire 2026", tier: "confirmed" },
  { company: "Cymbiotika", name: "Andrei Najjar", title: "Chief Marketing Officer", email: "andrei@cymbiotika.com", source: "CEO Outlook + Tradeflock 2025", tier: "confirmed" },
  { company: "Aptera Motors", name: "Sarah Hardwick", title: "Chief Marketing Officer", email: "sarah@aptera.us", linkedin: "linkedin.com/in/sarahhardwick", source: "Aptera leadership page", tier: "confirmed" },
  { company: "Heliogen", name: "Michelle Johnson Cobb", title: "SVP Marketing", email: "michelle@heliogen.com", source: "TheOrg + Heliogen leadership", tier: "confirmed" },
  { company: "Sun Bum", name: "Russell Radebaugh", title: "VP Marketing", email: "russell@sunbum.com", source: "Glossy + LinkedIn", tier: "confirmed" },
  { company: "Patrick Ta Beauty", name: "Jacqueline Barrett", title: "Head of Marketing", email: "jacqueline@patrickta.com", source: "Retail Dive (ex-Fenty Beauty)", tier: "confirmed" },
  { company: "Fishwife", name: "Lauren Murphy", title: "Sr. Brand Marketing Manager", email: "lauren@eatfishwife.com", linkedin: "linkedin.com/in/lauren-murphy-011a7b143", source: "LinkedIn", tier: "confirmed" },
  { company: "Apex Space", name: "Neil Presicci", title: "Marketing (title unconfirmed)", email: "neil.presicci@apexspace.com", source: "LinkedIn — ranking marketing IC", tier: "weak" },
  { company: "STAUD", name: "Stef O'Sullivan", title: "Head of Growth & Marketing", email: "stef@staud.clothing", source: "TheOrg — role may be transitioning", tier: "weak" },
  { company: "Harbinger Motors", name: "Fred DePerez", title: "SVP Sales (covers marketing)", email: "fred@harbingermotors.com", linkedin: "linkedin.com/in/freddeperez", source: "Harbinger leadership page", tier: "weak" },
];

async function run() {
  let created = 0;
  let skipped = 0;
  let missingCompany = 0;

  for (const lead of LEADS) {
    const company = await prisma.company.findUnique({
      where: { name: lead.company },
    });
    if (!company) {
      console.log(`⚠️  Company not found: ${lead.company}`);
      missingCompany++;
      continue;
    }

    const existing = await prisma.contact.findUnique({
      where: { email: lead.email },
    });
    if (existing) {
      console.log(`↪︎  Skip (exists): ${lead.name} <${lead.email}>`);
      skipped++;
      continue;
    }

    const note = [
      `Title: ${lead.title}`,
      lead.linkedin ? `LinkedIn: ${lead.linkedin}` : null,
      `Source: ${lead.source}`,
      `Email pattern: GUESS — verify on Apollo before send.`,
      `Tier: ${lead.tier}`,
    ]
      .filter(Boolean)
      .join("\n");

    await prisma.contact.create({
      data: {
        name: lead.name,
        email: lead.email,
        companyId: company.id,
        role: "Marketing lead",
        notes: note,
        tags: ["west-coast", "marketing-lead", `tier-${lead.tier}`, "apollo-unverified"],
      },
    });
    console.log(`✓  ${lead.company} — ${lead.name} (${lead.title})`);
    created++;
  }

  console.log("---");
  console.log(`Created: ${created}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Missing company records: ${missingCompany}`);
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
