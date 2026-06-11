import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Result = {
  oldEmail: string;
  newEmail: string | null; // null = leave as-is (Apollo no result)
  status: "confirmed" | "corrected" | "absent";
  note: string;
};

// Results from the Apollo verification pass on 2026-06-11 (waves 4-5)
const RESULTS: Result[] = [
  // Wave 4
  { oldEmail: "grant@whatnot.com", newEmail: null, status: "absent", note: "Not in Apollo. Keep guess." },
  { oldEmail: "doug@radiantnuclear.com", newEmail: "doug@radiantnuclear.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "isaiah@valaratomics.com", newEmail: "isaiah@valaratomics.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "john.tenet@chaosinc.com", newEmail: "john@chaosinc.com", status: "corrected", note: "Apollo correction — first name only" },
  { oldEmail: "mitch@arcboats.com", newEmail: "mitch@arcboats.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "jkudla@vuoriclothing.com", newEmail: "joe.kudla@vuori.com", status: "corrected", note: "Apollo correction — first.last AND domain is vuori.com" },
  { oldEmail: "tmansour@kalshi.com", newEmail: "tarekm@kalshi.com", status: "corrected", note: "Apollo correction — firstname+initial" },
  { oldEmail: "mikey@suno.com", newEmail: null, status: "absent", note: "Not in Apollo (Suno roster has no Shulman). Keep guess." },
  { oldEmail: "peter@davidprotein.com", newEmail: "peter@davidprotein.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "bazzell@unrivaled.basketball", newEmail: "alex@unrivaled.basketball", status: "corrected", note: "Apollo correction — first name only" },
  // Wave 5
  { oldEmail: "max.haot@vastspace.com", newEmail: "max@vastspace.com", status: "corrected", note: "Apollo correction — first name only" },
  { oldEmail: "tom@jetzero.aero", newEmail: "tom@jetzero.aero", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "lczinger@divergent3d.com", newEmail: "lczinger@divergent3d.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "danny.harris@aloyoga.com", newEmail: null, status: "absent", note: "Not in Apollo (ALO roster has no Danny Harris). Keep guess." },
  { oldEmail: "zach.rash@cocodelivery.com", newEmail: "zach@cocodelivery.com", status: "corrected", note: "Apollo correction — first name only" },
  { oldEmail: "matt@moveparallel.com", newEmail: "matt@moveparallel.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "amahdessian@servicetitan.com", newEmail: null, status: "absent", note: "Not in Apollo ServiceTitan roster. Keep guess." },
  { oldEmail: "dan@launchfirestorm.com", newEmail: "dan@launchfirestorm.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "ben@reflectorbital.com", newEmail: "ben@reflectorbital.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "justin@inversionspace.com", newEmail: "justin@inversionspace.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "will.ahmed@whoop.com", newEmail: "will@whoop.com", status: "corrected", note: "Apollo correction — first name only" },
  { oldEmail: "hamdi.ulukaya@chobani.com", newEmail: "hamdi.ulukaya@chobani.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "mlore@wonder.com", newEmail: "marc@wonder.com", status: "corrected", note: "Apollo correction — first name only. Domain is catch-all per Apollo." },
  { oldEmail: "cristobal@runwayml.com", newEmail: "cristobal@runwayml.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "hiroki@oishii.com", newEmail: "hiroki@oishii.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "jregev@thefarmersdog.com", newEmail: "jonathan@thefarmersdog.com", status: "corrected", note: "Apollo correction — first name only" },
  { oldEmail: "david.gutstadt@ballers-us.com", newEmail: null, status: "absent", note: "Apollo has his profile but no email available. Keep guess." },
  { oldEmail: "rylan@blw.ai", newEmail: null, status: "absent", note: "Not in Apollo Blue Water Autonomy roster. Keep guess." },
  { oldEmail: "shayne@polymarket.com", newEmail: "shaynecoplan@polymarket.com", status: "corrected", note: "Apollo correction — firstnamelastname" },
  { oldEmail: "jeremy.levine@underdogfantasy.com", newEmail: "jeremy.levine@underdogfantasy.com", status: "confirmed", note: "Apollo confirmed" },
];

async function run() {
  for (const r of RESULTS) {
    const existing = await prisma.contact.findUnique({ where: { email: r.oldEmail } });
    if (!existing) {
      console.log(`⚠️  Missing old contact: ${r.oldEmail}`);
      continue;
    }
    const baseTags = existing.tags.filter(
      (t) => t !== "apollo-unverified" && t !== "apollo-verified",
    );
    const newTags =
      r.status === "absent"
        ? [...baseTags, "apollo-unverified"]
        : [...baseTags, "apollo-verified"];
    await prisma.contact.update({
      where: { email: r.oldEmail },
      data: {
        email: r.newEmail ?? r.oldEmail,
        tags: newTags,
        notes: `${existing.notes ?? ""}\nApollo 2026-06-11: ${r.status}. ${r.note}`.trim(),
      },
    });
    console.log(`✓ ${r.status.padEnd(9)} ${r.newEmail ?? r.oldEmail}`);
  }
}

run().finally(() => prisma.$disconnect());
