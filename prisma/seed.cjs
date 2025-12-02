const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users and sample events...');

  // Clear existing data in order of relations
  await prisma.participant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: passwordHash,
    },
  });

  console.log('Created user admin@example.com / password123 with id', user.id);

  await prisma.event.createMany({
    data: [
      {
        title: 'AI & Future Tech Meetup',
        date: '15 มกราคม 2568',
        endDate: null,
        time: '09:00 - 12:00',
        location: 'Bangkok Convention Center',
        registered: 0,
        capacity: 50,
        status: 'scheduled',
        description: 'งานพบปะแลกเปลี่ยนความรู้ด้าน AI และเทคโนโลยีสำหรับองค์กร.',
      },
      {
        title: 'Digital Marketing Workshop',
        date: '20 มกราคม 2568',
        endDate: null,
        time: '13:00 - 17:00',
        location: 'True Digital Park',
        registered: 0,
        capacity: 80,
        status: 'open',
        description: 'เวิร์กชอปกลยุทธ์การทำการตลาดออนไลน์สำหรับธุรกิจขนาดเล็กและกลาง.',
      },
      {
        title: 'HR Tech Conference',
        date: '5 กุมภาพันธ์ 2568',
        endDate: null,
        time: '09:00 - 16:30',
        location: 'Samyan Mitrtown Hall',
        registered: 0,
        capacity: 120,
        status: 'scheduled',
        description: 'สัมมนาเทคโนโลยีเพื่อการบริหารทรัพยากรบุคคลยุคใหม่.',
      },
    ],
  });

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
