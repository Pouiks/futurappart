
const { PrismaClient } = require('@prisma/client');
/*
  Simple cleanup script.
  Run with: npx tsx src/scripts/clean_db.ts
*/
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning Database...");

  await prisma.stagingUnit.deleteMany({});

  // Cascades usually handle this regarding relations, but valid deletes:
  await prisma.favorite.deleteMany({});
  // Leads are critical but for this fix we assume dev mode or user approval
  // await prisma.subscriptionRequest.deleteMany({}); 

  await prisma.canonUnit.deleteMany({});
  await prisma.canonResidence.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.cityStatsDaily.deleteMany({});
  // Delete auto-generated city contents
  await prisma.cityContent.deleteMany({});

  console.log("Database Cleaned.");
  await prisma.$disconnect();
}

main().catch(console.error);
