import { PrismaClient } from '@prisma/client';
import { events, getParticipantsForEvent } from '../src/app/_data/database';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding events & participants...');

  // Clear existing data (optional, but useful for dev)
  await prisma.participant.deleteMany();
  await prisma.event.deleteMany();

  for (const event of events) {
    const createdEvent = await prisma.event.create({
      data: {
        title: event.title,
        date: event.date,
        endDate: event.endDate,
        time: event.time,
        location: event.location,
        registered: event.registered,
        capacity: event.capacity,
        status: event.status,
        description: event.description,
      },
    });

    const participants = getParticipantsForEvent(event.id);

    if (participants.length > 0) {
      await prisma.participant.createMany({
        data: participants.map((p) => ({
          eventId: createdEvent.id,
          name: p.name,
          org: p.org,
          position: p.position,
          email: p.email,
          phone: p.phone,
          status: p.status,
          regDate: p.regDate,
        })),
      });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
