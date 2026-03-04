import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const directors = await prisma.director.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  let created = 0;
  for (const d of directors) {
    if (d._count.projects === 0) continue;

    const existing = await prisma.update.findFirst({
      where: { directorId: d.id, type: "DIRECTOR_ADDED" },
    });
    if (existing) continue;

    const spotCount = d._count.projects;
    const plural = spotCount !== 1 ? "s" : "";

    await prisma.update.create({
      data: {
        type: "DIRECTOR_ADDED",
        title: `New Work: ${d.name}`,
        body: `${spotCount} spot${plural} imported from Wiredrive`,
        directorId: d.id,
        authorId: admin?.id || null,
      },
    });
    console.log(`  ✅ ${d.name} (${spotCount} spots)`);
    created++;
  }

  console.log(`\nCreated ${created} Signal updates`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
