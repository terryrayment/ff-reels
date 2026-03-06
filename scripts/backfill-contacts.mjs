#!/usr/bin/env node
/**
 * backfill-contacts.mjs
 *
 * Creates Contact + Company records from existing ScreeningLink data.
 * Groups by recipientEmail, picks best name, creates companies from
 * recipientCompany, then links ScreeningLinks to Contacts.
 *
 * Usage:  node scripts/backfill-contacts.mjs [--dry-run]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL + "?sslmode=require" } },
});

const dryRun = process.argv.includes("--dry-run");

async function main() {
  console.log(`\n📇 Backfilling contacts from screening links\n`);
  if (dryRun) console.log("  (DRY RUN — no changes will be made)\n");

  // 1. Get all screening links with recipient email but no contact
  const links = await prisma.screeningLink.findMany({
    where: {
      recipientEmail: { not: null },
      contactId: null,
    },
    select: {
      id: true,
      recipientName: true,
      recipientEmail: true,
      recipientCompany: true,
    },
  });

  console.log(`  Found ${links.length} screening links with email but no contact\n`);

  if (links.length === 0) {
    console.log("  Nothing to backfill.\n");
    return;
  }

  // 2. Group by email (case-insensitive)
  const byEmail = new Map();
  for (const link of links) {
    const email = link.recipientEmail.trim().toLowerCase();
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email).push(link);
  }

  console.log(`  ${byEmail.size} unique email addresses\n`);

  // 3. Collect unique company names
  const companyNames = new Set();
  for (const group of byEmail.values()) {
    for (const link of group) {
      if (link.recipientCompany?.trim()) {
        companyNames.add(link.recipientCompany.trim());
      }
    }
  }

  // 4. Create/find Company records
  const companyMap = new Map(); // name -> id
  for (const name of companyNames) {
    if (dryRun) {
      console.log(`  📦 Would create company: ${name}`);
      continue;
    }
    const company = await prisma.company.upsert({
      where: { name },
      create: { name, type: "Agency" },
      update: {},
    });
    companyMap.set(name, company.id);
  }
  console.log(`  ${companyNames.size} companies ${dryRun ? "would be" : ""} created/found\n`);

  // 5. Create Contact records and link ScreeningLinks
  let contactsCreated = 0;
  let linksUpdated = 0;

  for (const [email, group] of byEmail.entries()) {
    // Pick best name: longest non-null recipientName, fallback to email prefix
    const names = group
      .map((l) => l.recipientName?.trim())
      .filter(Boolean);
    const bestName =
      names.sort((a, b) => b.length - a.length)[0] || email.split("@")[0];

    // Pick company from any link in group
    const companyName = group
      .map((l) => l.recipientCompany?.trim())
      .find(Boolean);
    const companyId = companyName ? companyMap.get(companyName) : null;

    if (dryRun) {
      console.log(
        `  👤 Would create: ${bestName} <${email}>${companyName ? ` @ ${companyName}` : ""} (${group.length} links)`
      );
      contactsCreated++;
      linksUpdated += group.length;
      continue;
    }

    // Create contact (upsert to handle any races)
    const contact = await prisma.contact.upsert({
      where: { email },
      create: {
        name: bestName,
        email,
        companyId: companyId || undefined,
        tags: [],
      },
      update: {},
    });
    contactsCreated++;

    // Link all screening links in this group
    const linkIds = group.map((l) => l.id);
    await prisma.screeningLink.updateMany({
      where: { id: { in: linkIds } },
      data: { contactId: contact.id },
    });
    linksUpdated += linkIds.length;
  }

  console.log(
    `\n✅ Done. ${dryRun ? "Would create" : "Created"} ${contactsCreated} contacts, ${dryRun ? "would link" : "linked"} ${linksUpdated} screening links.\n`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
