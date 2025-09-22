import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple argv parsing: --apply and --verbose
const rawArgs = process.argv.slice(2);
const APPLY = rawArgs.includes('--apply');
const VERBOSE = rawArgs.includes('--verbose');

function log(...args) {
  if (VERBOSE) console.log(...args);
}

async function backfillPetTimestamps() {
  console.log('\n[1] Backfilling Pet createdAt/updatedAt where null');
  // Use a raw SQL query to find rows with null timestamps (handles schema mismatches)
  const rows = await prisma.$queryRawUnsafe('SELECT id, "createdAt" as createdAt, "updatedAt" as updatedAt FROM "Pet" WHERE "createdAt" IS NULL OR "updatedAt" IS NULL');
  console.log(`Found ${rows.length} pets with missing timestamps`);
  if (!APPLY) return;

  for (const r of rows) {
    const now = new Date();
    const createdAt = r.createdat || now;
    await prisma.pet.update({ where: { id: r.id }, data: { createdAt, updatedAt: now } });
    console.log(`Updated Pet id=${r.id}`);
  }
}

async function normalizeAvailability() {
  console.log('\n[2] Normalizing availability into 1-hour slots');
  const availabilities = await prisma.availability.findMany();
  console.log(`Found ${availabilities.length} availability ranges`);

  let createdCount = 0;
  let deletedCount = 0;
  for (const a of availabilities) {
    const start = new Date(a.start);
    const end = new Date(a.end);
    const durationMs = end.getTime() - start.getTime();
    const hourMs = 1000 * 60 * 60;
    if (durationMs <= hourMs) continue; // already <= 1h, keep as is

    // Break into 1-hour slots starting at original start
    const slots = [];
    let cursor = new Date(start);
    while (cursor.getTime() + hourMs <= end.getTime()) {
      const s = new Date(cursor);
      const e = new Date(cursor.getTime() + hourMs);
      slots.push({ userId: a.userId, start: s, end: e, createdAt: a.createdAt });
      cursor = new Date(cursor.getTime() + hourMs);
    }

    console.log(`Availability id=${a.id} -> splitting into ${slots.length} slots`);
    if (APPLY) {
      // create each slot if not exists
      for (const s of slots) {
        const exists = await prisma.availability.findFirst({ where: { userId: s.userId, start: s.start } });
        if (!exists) {
          await prisma.availability.create({ data: { userId: s.userId, start: s.start, end: s.end } });
          createdCount++;
        }
      }
      // delete original range
      await prisma.availability.delete({ where: { id: a.id } });
      deletedCount++;
    }
  }

  console.log(`Created ${createdCount} new 1-hour slots, deleted ${deletedCount} original ranges`);
}

async function deduplicateTutorsAndPets() {
  console.log('\n[3] Deduplicating tutors by email/phone and merging pets by name per tutor');

  // Deduplicate tutors by email (or phone) within same userId
  const users = await prisma.user.findMany();
  for (const u of users) {
    const tutors = await prisma.tutor.findMany({ where: { userId: u.id } });
    // group by email if available, else by phone
    const byContact = new Map();
    for (const t of tutors) {
      const key = t.email ? `e:${t.email}` : (t.phone ? `p:${t.phone}` : `id:${t.id}`);
      if (!byContact.has(key)) byContact.set(key, []);
      byContact.get(key).push(t);
    }

    for (const [key, group] of byContact.entries()) {
      if (group.length <= 1) continue;
      // keep the first, merge others
      const keeper = group[0];
      const others = group.slice(1);
      console.log(`User ${u.id}: merging ${others.length} tutors into tutor id=${keeper.id} (key=${key})`);
      if (APPLY) {
        for (const other of others) {
          // reassign pets
          await prisma.pet.updateMany({ where: { tutorId: other.id }, data: { tutorId: keeper.id } });
          // reassign appointments
          await prisma.appointment.updateMany({ where: { tutorId: other.id }, data: { tutorId: keeper.id } });
          // delete other tutor
          await prisma.tutor.delete({ where: { id: other.id } });
        }
      }
    }

    // For each tutor, dedupe pets by name
    const tutorsAfter = await prisma.tutor.findMany({ where: { userId: u.id } });
    for (const t of tutorsAfter) {
      const pets = await prisma.pet.findMany({ where: { tutorId: t.id } });
      const map = new Map();
      for (const p of pets) {
        const key = p.name.toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(p);
      }

      for (const [k, group] of map.entries()) {
        if (group.length <= 1) continue;
        const keeper = group[0];
        const others = group.slice(1);
        console.log(`Tutor ${t.id}: merging ${others.length} duplicate pets into pet id=${keeper.id} (name=${k})`);
        if (APPLY) {
          for (const other of others) {
            // reassign medical records, prescriptions, appointments
            await prisma.medicalRecord.updateMany({ where: { petId: other.id }, data: { petId: keeper.id } });
            await prisma.prescription.updateMany({ where: { petId: other.id }, data: { petId: keeper.id } });
            await prisma.appointment.updateMany({ where: { petId: other.id }, data: { petId: keeper.id } });
            // delete duplicate pet
            await prisma.pet.delete({ where: { id: other.id } });
          }
        }
      }
    }
  }
}

async function main() {
  try {
    await backfillPetTimestamps();
    await normalizeAvailability();
    await deduplicateTutorsAndPets();
    console.log('\nDone.');
  } catch (err) {
    console.error('Error cleaning DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
