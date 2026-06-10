import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function run() {
  const total = await p.contact.count();
  const all = await p.contact.findMany({
    include: { company: true },
    orderBy: { company: { name: "asc" } },
  });
  const roleHits = all.filter((c) =>
    /marketing|brand|cmo|growth|vp |head of|chief/i.test(c.role ?? "")
  );
  console.log(`Total contacts: ${total}`);
  console.log(`Role-matched: ${roleHits.length}`);
  console.log("---");
  for (const c of roleHits) {
    console.log(`${c.company?.name ?? "—"} | ${c.name} | ${c.role ?? ""} | ${c.email}`);
  }
  console.log("---DISTINCT ROLES---");
  const roles = new Set(all.map((c) => c.role).filter(Boolean));
  for (const r of roles) console.log(r);
}
run().finally(() => p.$disconnect());
