#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CHILE_TIMEZONE = 'America/Santiago';

function getChileDate() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = fmt.formatToParts(now).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);

  const utcMillis = Date.UTC(year, month - 1, day, hour, minute, second);
  return new Date(utcMillis);
}

async function run() {
  try {
    const now = getChileDate();
    const minutes = now.getMinutes();
    const quarter = Math.floor(minutes / 15) * 15;
    const lastQuarter = new Date(now);
    lastQuarter.setMinutes(quarter, 0, 0);
    const cutoff = new Date(lastQuarter.getTime() + 999);

    console.log(`Chile now: ${now.toISOString()}`);
    console.log(`Last quarter: ${lastQuarter.toISOString()}`);
    console.log(`Cutoff used: ${cutoff.toISOString()}`);

    const result = await prisma.availability.deleteMany({ where: { end: { lte: cutoff } } });
    console.log(`Deleted availability count: ${result.count}`);
  } catch (err) {
    console.error('Error force-cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => process.exit(0));
