#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { getChileDate } from './cleanup-expired-slots.js';

const prisma = new PrismaClient();

async function debug(userId) {
  try {
    const nowChile = getChileDate();
    const minutes = nowChile.getMinutes();
    const quarter = Math.floor(minutes / 15) * 15;
    const lastQuarter = new Date(nowChile);
    lastQuarter.setMinutes(quarter, 0, 0);
    const cutoff = new Date(lastQuarter.getTime() + 999);

    console.log(`Chile now: ${nowChile.toISOString()}`);
    console.log(`Last quarter: ${lastQuarter.toISOString()}`);
    console.log(`Cutoff (lastQuarter+999ms): ${cutoff.toISOString()}`);

    const where = userId ? { userId: Number(userId) } : {};
    const rows = await prisma.availability.findMany({ where, orderBy: { end: 'asc' }, take: 200 });

    console.log(`Found ${rows.length} availability rows (sample up to 200):`);
    let expiredCount = 0;
    for (const r of rows) {
      const s = new Date(r.start);
      const e = new Date(r.end);
      const status = e.getTime() <= cutoff.getTime() ? 'EXPIRED' : 'OK';
      if (status === 'EXPIRED') expiredCount++;
      console.log(`id=${r.id} userId=${r.userId} start=${s.toISOString()} end=${e.toISOString()} status=${status} (diff_ms=${e.getTime()-cutoff.getTime()})`);
    }

    console.log(`Expired according to cutoff: ${expiredCount}`);
  } catch (err) {
    console.error('Error debugging availability:', err);
  } finally {
    await prisma.$disconnect();
  }
}

// Allow passing optional userId as argument
const [, , userId] = process.argv;
debug(userId).then(() => process.exit(0));
