/**
 * Create an admin user for the FF Reels platform.
 * Usage: npx tsx scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function main() {
  console.log("\n🎬 FF Reels — Create Admin User\n");

  const name = await ask("Name: ");
  const email = await ask("Email: ");
  const password = await ask("Password: ");

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name },
    create: { email, passwordHash, role: "ADMIN", name },
  });

  console.log(`\n✅ Admin user created: ${user.email} (${user.id})\n`);

  rl.close();
  await prisma.$disconnect();
}

main().catch(console.error);
