const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock participants for existing events...');

  const events = await prisma.event.findMany({ orderBy: { id: 'asc' } });

  if (events.length === 0) {
    console.log('No events found. Please run "node prisma/seed.cjs" first.');
    return;
  }

  // Clear existing participants and reset registered counts
  await prisma.participant.deleteMany();
  await prisma.event.updateMany({ data: { registered: 0 } });

  const now = new Date();
  const regDate = now.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const participantsData = [];

  if (events[0]) {
    participantsData.push(
      {
        eventId: events[0].id,
        name: 'สมชาย ใจดี',
        org: 'ฝ่ายไอที',
        position: 'System Analyst',
        email: 'somchai@example.com',
        phone: '081-111-1111',
        status: 'confirmed',
        regDate,
      },
      {
        eventId: events[0].id,
        name: 'ศิริพร พัฒนางาน',
        org: 'ฝ่ายทรัพยากรบุคคล',
        position: 'HR Officer',
        email: 'siriporn@example.com',
        phone: '082-222-2222',
        status: 'confirmed',
        regDate,
      },
      {
        eventId: events[0].id,
        name: 'อัมพร อินทร์สุข',
        org: 'ฝ่ายการตลาด',
        position: 'Marketing Specialist',
        email: 'umphorn@example.com',
        phone: '083-333-3333',
        status: 'pending',
        regDate,
      },
    );
  }

  if (events[1]) {
    participantsData.push(
      {
        eventId: events[1].id,
        name: 'ณัฐวุฒิ กลยุทธ์ดี',
        org: 'ฝ่ายการตลาด',
        position: 'Digital Marketer',
        email: 'natthawut@example.com',
        phone: '084-444-4444',
        status: 'confirmed',
        regDate,
      },
      {
        eventId: events[1].id,
        name: 'วิภา ออนไลน์',
        org: 'ฝ่ายขาย',
        position: 'Sales Executive',
        email: 'wipa@example.com',
        phone: '085-555-5555',
        status: 'confirmed',
        regDate,
      },
    );
  }

  if (events[2]) {
    participantsData.push(
      {
        eventId: events[2].id,
        name: 'ประเสริฐ เอชอาร์',
        org: 'ฝ่ายทรัพยากรบุคคล',
        position: 'HR Manager',
        email: 'prasert@example.com',
        phone: '086-666-6666',
        status: 'confirmed',
        regDate,
      },
      {
        eventId: events[2].id,
        name: 'มาลี การพัฒนา',
        org: 'ฝ่ายพัฒนาองค์กร',
        position: 'OD Specialist',
        email: 'malee@example.com',
        phone: '087-777-7777',
        status: 'confirmed',
        regDate,
      },
      {
        eventId: events[2].id,
        name: 'ชาญชัย ทรัพยากรบุคคล',
        org: 'ฝ่ายทรัพยากรบุคคล',
        position: 'HR Officer',
        email: 'chanchai@example.com',
        phone: '088-888-8888',
        status: 'pending',
        regDate,
      },
    );
  }

  if (participantsData.length === 0) {
    console.log('No participants to seed.');
    return;
  }

  await prisma.participant.createMany({ data: participantsData });

  // Update registered count per event to match seeded participants
  const counts = participantsData.reduce((map, p) => {
    map[p.eventId] = (map[p.eventId] || 0) + 1;
    return map;
  }, {});

  for (const [eventId, count] of Object.entries(counts)) {
    await prisma.event.update({
      where: { id: Number(eventId) },
      data: { registered: count },
    });
  }

  console.log('Participant seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
