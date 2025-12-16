'use strict';

const path = require('path');

const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const EVENT_ID = 1;

function makePrisma() {
  const dbPath = path.resolve(process.cwd(), 'db', 'events.db');
  const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  return new PrismaClient({ adapter, log: ['error', 'warn'] });
}

async function main() {
  const prisma = makePrisma();

  try {
    const event = await prisma.event.findUnique({ where: { id: EVENT_ID }, select: { id: true } });
    if (!event) {
      throw new Error(`Event id=${EVENT_ID} not found`);
    }

    const count = await prisma.participant.count({ where: { eventId: EVENT_ID } });

    await prisma.event.update({
      where: { id: EVENT_ID },
      data: { registered: count },
    });

    console.log(`Synced event.registered for eventId=${EVENT_ID} to ${count}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
