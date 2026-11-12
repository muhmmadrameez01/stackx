import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  let connectionString = process.env.DATABASE_URL || '';

  // On Hostinger production environment, connections must route via 127.0.0.1:3306
  if (process.env.NODE_ENV === 'production') {
    if (!connectionString) {
      connectionString = 'mysql://u138406199_adil:Allah@726@127.0.0.1:3306/u138406199_stackai';
    } else if (connectionString.includes('.hstgr.io')) {
      connectionString = connectionString.replace(/@srv\d+\.hstgr\.io:3306/, '@127.0.0.1:3306');
    }
  }

  const adapter = new PrismaMariaDb(connectionString);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
