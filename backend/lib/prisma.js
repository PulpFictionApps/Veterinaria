import { PrismaClient } from '@prisma/client';

// Prisma client singleton for serverless environments
const globalForPrisma = globalThis;

let prisma;
if (!globalForPrisma.prisma) {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  // Always store in global to reuse connections in serverless
  globalForPrisma.prisma = prisma;
} else {
  prisma = globalForPrisma.prisma;
}

export default prisma;
