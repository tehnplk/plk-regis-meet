const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/events.db',
});

const prisma = new PrismaClient({
  adapter,
});

const events = [
  {
    title: 'เวิร์กช็อป AI สำหรับงานสารบรรณ',
    date: '2025-12-09',
    endDate: null,
    time: '09:00 - 12:00',
    location: 'ห้องประชุมใหญ่ ชั้น 2 ศาลากลางจังหวัด',
    latitude: null,
    longitude: null,
    enableCheckInRadius: false,
    checkInRadiusMeters: null,
    registered: 0,
    capacity: 80,
    status: 'open',
    description: 'สอนการใช้เครื่องมือ AI เพื่อช่วยงานเอกสารภาครัฐอย่างมีประสิทธิภาพ',
    docLink: null,
    requiredItems: 'สมุดโน้ต, ปากกา',
  },
  {
    title: 'สัมมนา Data Governance ภาครัฐ',
    date: '2025-12-09',
    endDate: null,
    time: '13:00 - 15:30',
    location: 'ห้องประชุมฝ่ายยุทธศาสตร์',
    latitude: null,
    longitude: null,
    enableCheckInRadius: false,
    checkInRadiusMeters: null,
    registered: 0,
    capacity: 100,
    status: 'open',
    description: 'แนวทางการจัดการข้อมูลและความมั่นคงปลอดภัยสำหรับหน่วยงานท้องถิ่น',
    docLink: null,
    requiredItems: 'โน้ตบุ๊ก',
  },
  {
    title: 'อบรม AI สรุปรายงานอัตโนมัติ',
    date: '2025-12-09',
    endDate: null,
    time: '15:45 - 17:00',
    location: 'ห้องอบรมคอมพิวเตอร์ ศาลากลางจังหวัด',
    latitude: null,
    longitude: null,
    enableCheckInRadius: false,
    checkInRadiusMeters: null,
    registered: 0,
    capacity: 60,
    status: 'open',
    description: 'สาธิตการใช้ AI ช่วยสรุปรายงานประจำวันและสรุปการประชุม',
    docLink: null,
    requiredItems: 'คอมพิวเตอร์โน้ตบุ๊ก, ที่ชาร์จ',
  },
];

async function main() {
  await prisma.event.createMany({ data: events });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
