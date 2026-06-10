import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Result = {
  oldEmail: string;
  newEmail: string | null; // null = leave as-is (Apollo no result)
  newName?: string;
  newRole?: string;
  status: "confirmed" | "corrected" | "replaced" | "stale" | "absent";
  note: string;
};

// Results from the Apollo verification pass on 2026-05-27
const RESULTS: Result[] = [
  // Confirmed exact match
  { oldEmail: "leslie@castelion.com", newEmail: "leslie@castelion.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "cindy@flybyjing.com", newEmail: "cindy@flybyjing.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "jacqueline@patrickta.com", newEmail: "jacqueline@patrickta.com", newRole: "SVP Marketing", status: "confirmed", note: "Apollo confirmed; title upgrade to SVP Marketing" },
  { oldEmail: "lauren@eatfishwife.com", newEmail: "lauren@eatfishwife.com", status: "confirmed", note: "Apollo confirmed" },
  { oldEmail: "neil.presicci@apexspace.com", newEmail: "neil.presicci@apexspace.com", newRole: "Head of Marketing", status: "confirmed", note: "Apollo confirmed; title upgrade to Head of Marketing (was 'unconfirmed')" },

  // Corrected (Apollo gave different email for same person)
  { oldEmail: "alex@varda.com", newEmail: "apearlman@varda.com", status: "corrected", note: "Apollo correction — pattern is first-initial+lastname" },
  { oldEmail: "kelli.furrer@slingshotaerospace.com", newEmail: "k.furrer@slingshotaerospace.com", status: "corrected", note: "Apollo correction — pattern is first-initial.lastname" },
  { oldEmail: "fred@harbingermotors.com", newEmail: "fred.deperez@harbingermotors.com", status: "corrected", note: "Apollo correction — pattern is first.last" },

  // Replaced (research had wrong person; Apollo shows different actual marketing lead at the company)
  { oldEmail: "alex.moore@epirusinc.com", newEmail: "shane.karp@epirusinc.com", newName: "Shane Karp", newRole: "VP, Marketing & Comms", status: "replaced", note: "Apollo shows Shane Karp as actual VP Marketing & Comms at Epirus; Alex Moore not in Apollo. Replaced." },

  // Absent in Apollo or stale; keep guess
  { oldEmail: "chandra.rangan@shield.ai", newEmail: null, status: "absent", note: "Not in Apollo. Keep guess — Shield AI confirmed via shield.ai/company-executives. Pattern first.last per Brandon Tseng." },
  { oldEmail: "abiola@mytopicals.com", newEmail: null, status: "stale", note: "Apollo lists her as SXSW Judge (side gig), not Topicals. Keep guess." },
  { oldEmail: "anisha@seed.com", newEmail: null, status: "stale", note: "Apollo only has her at Heyday (prior role). PRNewswire announced Seed CMO May 2026 — too recent for Apollo." },
  { oldEmail: "aila@meritbeauty.com", newEmail: null, status: "absent", note: "Not in Apollo. Keep guess." },
  { oldEmail: "andrei@cymbiotika.com", newEmail: null, status: "absent", note: "Not in Apollo. Keep guess." },
  { oldEmail: "sarah@aptera.us", newEmail: null, status: "absent", note: "Not in Apollo at Aptera. Keep guess." },
  { oldEmail: "michelle@heliogen.com", newEmail: null, status: "absent", note: "Not in Apollo. Keep guess." },
  { oldEmail: "russell@sunbum.com", newEmail: null, status: "absent", note: "Apollo only has a different Russell Radebaugh at Techno Plas. Keep guess." },
  { oldEmail: "stef@staud.clothing", newEmail: null, status: "absent", note: "Not in Apollo. Keep guess." },
];

async function run() {
  for (const r of RESULTS) {
    const existing = await prisma.contact.findUnique({
      where: { email: r.oldEmail },
      include: { company: true },
    });
    if (!existing) {
      console.log(`⚠️  Missing old contact: ${r.oldEmail}`);
      continue;
    }

    // Tags: drop "apollo-unverified" if confirmed/corrected/replaced
    const baseTagsWithoutVerification = existing.tags.filter(
      (t) => t !== "apollo-unverified" && t !== "apollo-verified",
    );
    const newTags =
      r.status === "absent" || r.status === "stale"
        ? [...baseTagsWithoutVerification, "apollo-unverified"]
        : [...baseTagsWithoutVerification, "apollo-verified"];

    // Note suffix
    const apolloLine = `Apollo pass (2026-05-27): ${r.status.toUpperCase()} — ${r.note}`;
    const newNotes = existing.notes
      ? `${existing.notes}\n${apolloLine}`
      : apolloLine;

    if (r.newEmail && r.newEmail !== r.oldEmail) {
      // Email change: delete old, recreate with new email (since email is unique).
      // Use update if possible — Prisma allows update of unique field.
      await prisma.contact.update({
        where: { id: existing.id },
        data: {
          email: r.newEmail,
          name: r.newName ?? existing.name,
          role: r.newRole ?? existing.role,
          notes: newNotes,
          tags: newTags,
        },
      });
      console.log(`✏️  ${existing.company?.name}: ${r.oldEmail} → ${r.newEmail} (${r.status})`);
    } else {
      await prisma.contact.update({
        where: { id: existing.id },
        data: {
          name: r.newName ?? existing.name,
          role: r.newRole ?? existing.role,
          notes: newNotes,
          tags: newTags,
        },
      });
      console.log(`✓  ${existing.company?.name}: ${r.oldEmail} (${r.status})`);
    }
  }
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
