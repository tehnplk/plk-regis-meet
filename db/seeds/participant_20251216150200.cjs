'use strict';

const fs = require('fs');
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

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

async function main() {
  const prisma = makePrisma();

  try {
    const csvPath = path.resolve(process.cwd(), 'mock', 'regis_people.csv');
    const raw = fs.readFileSync(csvPath, 'utf8');

    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length <= 1) {
      console.log('No CSV rows found.');
      return;
    }

    const header = lines[0];
    const dataLines = lines.slice(1);

    const event = await prisma.event.findUnique({ where: { id: EVENT_ID }, select: { id: true } });
    if (!event) {
      throw new Error(`Event id=${EVENT_ID} not found`);
    }

    if (!header.includes('ชื่อ') || !header.includes('ตำแหน่ง') || !header.includes('หน่วยงาน')) {
      console.warn('Warning: CSV header does not look like expected format:', header);
    }

    const existing = await prisma.participant.findMany({
      where: { eventId: EVENT_ID },
      select: { name: true, org: true, position: true },
    });

    const existingKeys = new Set(
      existing.map((p) => `${normalizeKey(p.name)}|${normalizeKey(p.org)}|${normalizeKey(p.position)}`),
    );

    const now = new Date();
    const regDate = now.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const toCreate = [];

    for (const line of dataLines) {
      const cols = parseCsvLine(line).map((c) => String(c ?? '').trim());
      const name = cols[1] ?? '';
      const position = cols[2] ?? '';
      const org = cols[3] ?? '';

      if (!name || !org) continue;

      const key = `${normalizeKey(name)}|${normalizeKey(org)}|${normalizeKey(position)}`;
      if (existingKeys.has(key)) continue;

      existingKeys.add(key);

      toCreate.push({
        eventId: EVENT_ID,
        name,
        org,
        position,
        email: '',
        phone: '-',
        providerId: null,
        foodType: null,
        status: 'confirmed',
        regDate,
        regTime: now,
      });
    }

    if (toCreate.length === 0) {
      console.log('Nothing to insert (all rows already exist or empty).');
      return;
    }

    const result = await prisma.participant.createMany({
      data: toCreate,
    });

    console.log(`Inserted participants: ${result.count}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
