export type EventStatus =
  | "scheduled"
  | "open"
  | "confirmed"
  | "full"
  | "pending"
  | "closed"
  | "cancelled"
  | "postponed";

export type ParticipantStatus = "confirmed" | "pending" | "cancelled";

export interface Event {
  id: number;
  title: string;
  date: string;
  endDate: string | null;
  time: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  enableCheckInRadius?: boolean;
  checkInRadiusMeters?: number | null;
  registered: number;
  capacity: number;
  status: EventStatus;
  description: string;
}

export interface Participant {
  id: number;
  eventId: number;
  name: string;
  org: string;
  position: string;
  email: string;
  phone: string;
  foodType?: 'normal' | 'islam';
  status: ParticipantStatus;
  regDate: string;
}

export const STATUS_LABELS: Record<EventStatus | ParticipantStatus, string> = {
  scheduled: "ตามกำหนด",
  open: "เปิดลงทะเบียน",
  confirmed: "ยืนยันแล้ว",
  full: "ที่นั่งเต็ม",
  pending: "รอชำระเงิน",
  closed: "ปิดรับสมัคร",
  cancelled: "ยกเลิก",
  postponed: "เลื่อน",
};

export const events: Event[] = [
  {
    id: 1,
    title: "AI & Future Technology Summit 2025",
    date: "15 มกราคม 2568",
    endDate: "17 มกราคม 2568",
    time: "09:00 - 16:30",
    location: "Grand Hall, BITEC Bangna",
    registered: 142,
    capacity: 200,
    status: "scheduled",
    description:
      "งานสัมมนาเทคโนโลยีแห่งอนาคตและการประยุกต์ใช้ AI ในภาคธุรกิจ (3 วัน)",
  },
  {
    id: 2,
    title: "Digital Marketing Strategy Workshop",
    date: "22 กุมภาพันธ์ 2568",
    endDate: null,
    time: "13:00 - 17:00",
    location: "Meeting Room 401, True Digital Park",
    registered: 50,
    capacity: 50,
    status: "full",
    description:
      "เวิร์กชอปเจาะลึกกลยุทธ์การตลาดออนไลน์สำหรับ SME",
  },
  {
    id: 3,
    title: "HR Tech Conference Thailand",
    date: "10 มีนาคม 2568",
    endDate: null,
    time: "08:30 - 17:00",
    location: "Samyan Mitrtown Hall",
    registered: 80,
    capacity: 300,
    status: "postponed",
    description:
      "นวัตกรรมการบริหารทรัพยากรบุคคลยุคใหม่ (เลื่อนการจัดงานอย่างไม่มีกำหนด)",
  },
  {
    id: 4,
    title: "Startup Pitching Day 2025",
    date: "1 เมษายน 2568",
    endDate: null,
    time: "09:00 - 12:00",
    location: "Glowfish Sathorn",
    registered: 10,
    capacity: 100,
    status: "cancelled",
    description: "เวทีนำเสนอไอเดียธุรกิจสตาร์ทอัพเพื่อระดมทุน",
  },
];

const participants: Participant[] = [
  {
    id: 101,
    eventId: 1,
    name: "สมชาย ใจดี",
    org: "บริษัท เทคโซลูชั่น จำกัด",
    position: "Senior Developer",
    email: "somchai@tech.co.th",
    phone: "081-111-1111",
    status: "confirmed",
    regDate: "01/12/2567",
  },
  {
    id: 102,
    eventId: 1,
    name: "วิภาดา รักงาน",
    org: "SME Bank",
    position: "Marketing Manager",
    email: "wiphada@sme.com",
    phone: "089-222-2222",
    status: "pending",
    regDate: "02/12/2567",
  },
  {
    id: 103,
    eventId: 1,
    name: "ก้องเกียรติ มั่นคง",
    org: "Freelance",
    position: "Designer",
    email: "kong@design.io",
    phone: "090-333-3333",
    status: "cancelled",
    regDate: "03/12/2567",
  },
  {
    id: 104,
    eventId: 1,
    name: "อารียา สุขใจ",
    org: "มหาวิทยาลัยเชียงใหม่",
    position: "Researcher",
    email: "areeya@cmu.ac.th",
    phone: "086-444-4444",
    status: "confirmed",
    regDate: "05/12/2567",
  },
  {
    id: 105,
    eventId: 1,
    name: "ณัฐพล คนเก่ง",
    org: "Startup One",
    position: "CTO",
    email: "nattapol@startup.one",
    phone: "087-555-5555",
    status: "confirmed",
    regDate: "06/12/2567",
  },
];

export const getEventById = (id: number) =>
  events.find((event) => event.id === id);

export const getParticipantsForEvent = (eventId: number) =>
  participants.filter((participant) => participant.eventId === eventId);

export const isRegistrationDisabled = (status: EventStatus) =>
  ["full", "closed", "cancelled", "postponed"].includes(status);
