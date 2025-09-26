import { PrismaClient } from '@prisma/client';

// Prisma client singleton for serverless environments
const globalForPrisma = globalThis;

let prisma;
if (!globalForPrisma.prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} else {
  prisma = globalForPrisma.prisma;
}

export default prisma;
