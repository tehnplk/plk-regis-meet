import path from 'path';
import { PrismaClient } from '@prisma/client';

const normalizeSqliteUrl = (url?: string) => {
  if (!url?.startsWith('file:')) return url;

  const prefix = 'file:';
  const filePath = url.slice(prefix.length);

  if (!filePath.startsWith('./') && !filePath.startsWith('../')) {
    return url;
  }

  const absolutePath = path.resolve(process.cwd(), filePath);
  return `${prefix}${absolutePath}`;
};

const normalizedDbUrl = normalizeSqliteUrl(process.env.DATABASE_URL);
if (normalizedDbUrl && normalizedDbUrl !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizedDbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
