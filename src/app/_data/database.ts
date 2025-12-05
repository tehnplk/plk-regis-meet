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
  beginDate: string;
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
  docLink?: string | null;
  requiredItems?: string | null;
  providerIdCreated?: string | null;
  datetimeCreated?: string | Date;
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

