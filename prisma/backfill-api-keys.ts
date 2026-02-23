import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const members = await prisma.member.findMany({ where: { apiKey: null } });
  for (const member of members) {
    const apiKey = `ak_${crypto.randomBytes(16).toString("hex")}`;
    await prisma.member.update({
      where: { id: member.id },
      data: { apiKey },
    });
  }
  console.log(`Backfilled API keys for ${members.length} members`);
}

main().finally(() => prisma.$disconnect());
