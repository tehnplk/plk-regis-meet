// Seed participants: ensure each event has at least 10 participants
// Run with: node prisma/participants_20251204154000.cjs

// NOTE: This script now uses the default Prisma Client connection.

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function formatThaiDate(date) {
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

async function main() {
  const events = await prisma.event.findMany({ orderBy: { id: 'asc' } });

  console.log(`Found ${events.length} events. Seeding participants (target 10 per event)...`);

  for (const event of events) {
    const existingCount = await prisma.participant.count({
      where: { eventId: event.id },
    });

    const toCreate = 10 - existingCount;

    if (toCreate <= 0) {
      console.log(`Event ${event.id}: already has ${existingCount} participants, skipping.`);
      continue;
    }

    console.log(
      `Event ${event.id}: has ${existingCount} participants, creating ${toCreate} more...`,
    );

    const now = new Date();
    const regDate = formatThaiDate(now);

    const participantsData = Array.from({ length: toCreate }).map((_, index) => {
      const n = existingCount + index + 1;
      return {
        eventId: event.id,
        name: `Seed User ${n} (Event ${event.id})`,
        org: 'Seed Organization',
        position: 'Attendee',
        email: `seed${event.id}_${n}@example.com`,
        phone: '0810000000',
        foodType: n % 2 === 0 ? 'normal' : 'islam',
        status: 'confirmed',
        regDate,
      };
    });

    await prisma.$transaction([
      prisma.participant.createMany({ data: participantsData }),
      prisma.event.update({
        where: { id: event.id },
        data: {
          registered: existingCount + toCreate,
        },
      }),
    ]);

    console.log(`Event ${event.id}: done. Total participants now ${existingCount + toCreate}.`);
  }

  console.log('Seeding participants completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
