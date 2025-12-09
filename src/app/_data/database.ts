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
  registerMethod?: number; // 1=provider_id only, 2=form only, 3=both
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
  providerId?: string | null;
  foodType?: 'normal' | 'islam';
  status: ParticipantStatus;
  regDate: string;
  regTime: string | Date;
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

