#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run(id) {
  try {
    console.log(`Attempting to delete availability id=${id}`);
    await prisma.availability.delete({ where: { id: Number(id) } });
    console.log(`Deleted id=${id}`);
  } catch (err) {
    console.error('Delete error:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

const [, , id] = process.argv;
if (!id) {
  console.error('Usage: node test-delete-id.js <id>');
  process.exit(1);
}
run(id).then(() => process.exit(0));
