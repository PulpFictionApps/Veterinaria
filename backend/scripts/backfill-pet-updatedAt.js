#!/usr/bin/env node
// Backfill Pet.updatedAt where NULL using Prisma client.
// Usage: node backend/scripts/backfill-pet-updatedAt.js --apply

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  console.log('Running backfill-pet-updatedAt. apply=', apply);

  const allPets = await prisma.pet.findMany();
  const pets = allPets.filter(p => p.updatedAt === null || p.updatedAt === undefined);
  console.log(`Found ${pets.length} pets with null updatedAt`);
  if (pets.length === 0) return;

  for (const p of pets) {
    const newDate = p.createdAt || new Date();
    console.log(`Would update pet id=${p.id} set updatedAt='${newDate.toISOString()}'`);
    if (apply) {
      await prisma.pet.update({ where: { id: p.id }, data: { updatedAt: newDate } });
      console.log('Applied.');
    }
  }

  if (!apply) console.log('\nDry-run mode: re-run with --apply to perform updates');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
