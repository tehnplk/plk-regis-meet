const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample events...');

  // เคลียร์ข้อมูล Event เดิมทั้งหมด (dev only)
  await prisma.event.deleteMany({});

  const baseDate = '2025-12';

  const events = [
    {
      title: 'สัมมนา Digital Government 2025',
      date: `${baseDate}-10`,
      endDate: `${baseDate}-10`,
      time: '09:00 - 16:00',
      location: 'ห้องประชุมใหญ่ ศาลากลางจังหวัด',
      latitude: 7.0086,
      longitude: 100.4746,
      enableCheckInRadius: true,
      checkInRadiusMeters: 300,
      registered: 0,
      capacity: 120,
      status: 'open',
      description: 'การประชุมเชิงปฏิบัติการด้านรัฐบาลดิจิทัลสำหรับหน่วยงานภาครัฐ.',
      docLink: null,
    },
    {
      title: 'อบรมการใช้ระบบ e-Document',
      date: `${baseDate}-12`,
      endDate: `${baseDate}-12`,
      time: '13:00 - 16:30',
      location: 'ห้องอบรมชั้น 3 ศาลากลางจังหวัด',
      latitude: null,
      longitude: null,
      enableCheckInRadius: false,
      checkInRadiusMeters: null,
      registered: 0,
      capacity: 60,
      status: 'open',
      description: 'การอบรมเพื่อใช้งานระบบสารบรรณอิเล็กทรอนิกส์ (e-Document).',
      docLink: null,
    },
    {
      title: 'โครงการพัฒนาศักยภาพผู้นำชุมชน',
      date: `${baseDate}-15`,
      endDate: `${baseDate}-16`,
      time: '08:30 - 16:30',
      location: 'ศูนย์ประชุมอำเภอเมือง',
      latitude: 7.017,
      longitude: 100.48,
      enableCheckInRadius: true,
      checkInRadiusMeters: 200,
      registered: 0,
      capacity: 80,
      status: 'open',
      description: 'เสริมสร้างความรู้และทักษะด้านการบริหารจัดการชุมชน.',
      docLink: null,
    },
    {
      title: 'การประชุมคณะกรรมการจังหวัดประจำเดือน',
      date: `${baseDate}-18`,
      endDate: null,
      time: '09:30 - 12:00',
      location: 'ห้องประชุมผู้ว่าราชการจังหวัด',
      latitude: null,
      longitude: null,
      enableCheckInRadius: false,
      checkInRadiusMeters: null,
      registered: 0,
      capacity: 40,
      status: 'scheduled',
      description: 'การประชุมติดตามผลการดำเนินงานของส่วนราชการในจังหวัด.',
      docLink: null,
    },
    {
      title: 'เวทีรับฟังความคิดเห็นแผนพัฒนาจังหวัด',
      date: `${baseDate}-20`,
      endDate: `${baseDate}-20`,
      time: '13:30 - 16:30',
      location: 'หอประชุมเทศบาลเมือง',
      latitude: null,
      longitude: null,
      enableCheckInRadius: false,
      checkInRadiusMeters: null,
      registered: 0,
      capacity: 200,
      status: 'open',
      description: 'เปิดเวทีรับฟังความคิดเห็นจากประชาชนต่อร่างแผนพัฒนาจังหวัด.',
      docLink: null,
    },
    {
      title: 'ซ้อมแผนป้องกันและบรรเทาสาธารณภัยประจำปี',
      date: `${baseDate}-22`,
      endDate: `${baseDate}-22`,
      time: '08:00 - 15:30',
      location: 'ลานหน้าศาลากลางจังหวัด',
      latitude: 7.01,
      longitude: 100.471,
      enableCheckInRadius: true,
      checkInRadiusMeters: 400,
      registered: 0,
      capacity: 150,
      status: 'open',
      description: 'การฝึกซ้อมแผนร่วมกันระหว่างหน่วยงานด้านความปลอดภัยและชุมชน.',
      docLink: null,
    },
    {
      title: 'อบรมการใช้งานระบบลงทะเบียนออนไลน์',
      date: `${baseDate}-24`,
      endDate: `${baseDate}-24`,
      time: '09:00 - 12:00',
      location: 'ห้องอบรมคอมพิวเตอร์ ศาลากลางจังหวัด',
      latitude: null,
      longitude: null,
      enableCheckInRadius: false,
      checkInRadiusMeters: null,
      registered: 0,
      capacity: 50,
      status: 'open',
      description: 'แนะนำวิธีการใช้งานระบบลงทะเบียนออนไลน์สำหรับเจ้าหน้าที่.',
      docLink: null,
    },
    {
      title: 'ประชุมคณะทำงานด้านข้อมูลสารสนเทศ',
      date: `${baseDate}-25`,
      endDate: null,
      time: '10:00 - 12:00',
      location: 'ห้องประชุมฝ่ายยุทธศาสตร์',
      latitude: null,
      longitude: null,
      enableCheckInRadius: false,
      checkInRadiusMeters: null,
      registered: 0,
      capacity: 30,
      status: 'scheduled',
      description: 'ประชุมกำหนดแนวทางการจัดเก็บและใช้ประโยชน์ข้อมูลของจังหวัด.',
      docLink: null,
    },
    {
      title: 'กิจกรรมจิตอาสาพัฒนาสิ่งแวดล้อม',
      date: `${baseDate}-27`,
      endDate: `${baseDate}-27`,
      time: '07:30 - 11:30',
      location: 'สวนสาธารณะกลางเมือง',
      latitude: null,
      longitude: null,
      enableCheckInRadius: false,
      checkInRadiusMeters: null,
      registered: 0,
      capacity: 300,
      status: 'open',
      description: 'กิจกรรมจิตอาสาร่วมกันทำความสะอาดและปรับภูมิทัศน์.',
      docLink: null,
    },
    {
      title: 'สัมมนาสรุปผลการดำเนินงานประจำปี',
      date: `${baseDate}-29`,
      endDate: `${baseDate}-29`,
      time: '09:00 - 15:00',
      location: 'โรงแรมในตัวเมือง',
      latitude: null,
      longitude: null,
      enableCheckInRadius: false,
      checkInRadiusMeters: null,
      registered: 0,
      capacity: 100,
      status: 'open',
      description: 'สรุปภาพรวมผลการดำเนินงานและทิศทางการพัฒนาต่อไปในปีถัดไป.',
      docLink: null,
    },
  ];

  await prisma.event.createMany({ data: events });

  console.log('Seeded', events.length, 'events');
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
