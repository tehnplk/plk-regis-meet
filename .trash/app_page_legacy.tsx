'use client';

// TEAM_001: Migrated prototype event registration UI into the Next.js app entry.

import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  FileText,
  MapPin,
  MoreHorizontal,
  Search,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";

type ConferenceStatus =
  | "scheduled"
  | "open"
  | "confirmed"
  | "full"
  | "pending"
  | "closed"
  | "cancelled"
  | "postponed";

type ParticipantStatus = "confirmed" | "pending" | "cancelled";

type StatusType = ConferenceStatus | ParticipantStatus;

interface Conference {
  id: number;
  title: string;
  date: string;
  endDate: string | null;
  time: string;
  location: string;
  registered: number;
  capacity: number;
  status: ConferenceStatus;
  description: string;
}

interface Participant {
  id: number;
  confId: number;
  name: string;
  org: string;
  position: string;
  email: string;
  phone: string;
  status: ParticipantStatus;
  regDate: string;
}

const conferences: Conference[] = [
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
    description: "นวัตกรรมการบริหารทรัพยากรบุคคลยุคใหม่ (เลื่อนการจัดงานอย่างไม่มีกำหนด)",
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

const mockParticipants: Participant[] = [
  {
    id: 101,
    confId: 1,
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
    confId: 1,
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
    confId: 1,
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
    confId: 1,
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
    confId: 1,
    name: "ณัฐพล คนเก่ง",
    org: "Startup One",
    position: "CTO",
    email: "nattapol@startup.one",
    phone: "087-555-5555",
    status: "confirmed",
    regDate: "06/12/2567",
  },
];

const STATUS_STYLES: Record<StatusType, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  open: "bg-green-100 text-green-700 border-green-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  full: "bg-orange-100 text-orange-700 border-orange-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  postponed: "bg-purple-100 text-purple-700 border-purple-200",
};

const STATUS_LABELS: Record<StatusType, string> = {
  scheduled: "ตามกำหนด",
  open: "เปิดลงทะเบียน",
  confirmed: "ยืนยันแล้ว",
  full: "ที่นั่งเต็ม",
  pending: "รอชำระเงิน",
  closed: "ปิดรับสมัคร",
  cancelled: "ยกเลิก",
  postponed: "เลื่อน",
};

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference | null;
}

const RegistrationModal = ({ isOpen, onClose, conference }: RegistrationModalProps) => {
  if (!isOpen || !conference) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTimeout(() => {
      window.alert(`ลงทะเบียนสำเร็จสำหรับงาน: ${conference.title}`);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg transform rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">ลงทะเบียนเข้าร่วมงาน</h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">{conference.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close registration form"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="กรอกชื่อและนามสกุล"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                หน่วยงาน <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="ระบุบริษัท/องค์กร"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">ตำแหน่ง</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="ระบุตำแหน่ง"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="08x-xxx-xxxx"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            <CheckCircle size={14} className="mt-0.5 shrink-0" />
            <p>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน ระบบจะส่งอีเมลยืนยันการลงทะเบียนไปยังอีเมลที่ท่านระบุไว้</p>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
            >
              <UserPlus size={18} />
              ยืนยันการลงทะเบียน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: StatusType }) => (
  <span
    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
      STATUS_STYLES[status] ?? STATUS_STYLES.closed
    }`}
  >
    {STATUS_LABELS[status] ?? status}
  </span>
);

const DateDisplay = ({ startDate, endDate, iconSize = 16 }: { startDate: string; endDate: string | null; iconSize?: number }) => (
  <div className="flex items-center gap-2">
    <Calendar size={iconSize} className="shrink-0 text-blue-500" />
    <span>
      {startDate}
      {endDate && endDate !== startDate ? ` - ${endDate}` : ""}
    </span>
  </div>
);

const Header = () => (
  <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-blue-600 p-2">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">EventReg System</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right text-sm sm:block">
          <p className="font-medium text-gray-900">แอดมิน (Admin)</p>
          <p className="text-xs text-gray-500">แผนกทรัพยากรบุคคล</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
          A
        </div>
      </div>
    </div>
  </header>
);

interface ConferenceListProps {
  onSelect: (conference: Conference) => void;
  onRegisterClick: (conference: Conference) => void;
}

const ConferenceList = ({ onSelect, onRegisterClick }: ConferenceListProps) => (
  <div className="mx-auto max-w-7xl space-y-6 p-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">รายการการประชุม</h2>
        <p className="mt-1 text-sm text-gray-500">จัดการและดูรายละเอียดการประชุมทั้งหมด</p>
      </div>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700"
      >
        <UserPlus size={18} />
        <span>สร้างการประชุมใหม่</span>
      </button>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {conferences.map((conf) => {
        const isUnavailable = ["full", "closed", "cancelled", "postponed"].includes(conf.status);
        const progress = Math.min((conf.registered / conf.capacity) * 100, 100);

        return (
          <article
            key={conf.id}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex-1 p-5">
              <div className="mb-3 flex items-start justify-between">
                <StatusBadge status={conf.status} />
                <button type="button" className="text-gray-400 transition-colors hover:text-gray-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900">{conf.title}</h3>
              <p className="mb-4 line-clamp-2 text-sm text-gray-500">{conf.description}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <DateDisplay startDate={conf.date} endDate={conf.endDate} />
                <div className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0 text-blue-500" />
                  <span>{conf.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="shrink-0 text-blue-500" />
                  <span className="truncate">{conf.location}</span>
                </div>
              </div>
            </div>
            <div className="mt-auto border-t border-gray-100 bg-gray-50 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Users size={16} />
                  <span>
                    {conf.registered} / {conf.capacity} คน
                  </span>
                </div>
                <div className="h-2 w-24 rounded-full bg-gray-200">
                  <div className={`h-2 rounded-full ${conf.registered >= conf.capacity ? "bg-orange-500" : "bg-blue-500"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isUnavailable}
                  onClick={() => onRegisterClick(conf)}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium shadow-sm transition-colors ${
                    isUnavailable
                      ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {conf.status === "cancelled" ? (
                    <XCircle size={16} />
                  ) : conf.status === "postponed" ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  <span>
                    {conf.status === "cancelled"
                      ? "ยกเลิกแล้ว"
                      : conf.status === "postponed"
                        ? "เลื่อน"
                        : conf.status === "full"
                          ? "เต็ม"
                          : "ลงทะเบียน"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(conf)}
                  className="rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                >
                  ดูรายชื่อ
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  </div>
);

interface ParticipantListProps {
  conference: Conference;
  onBack: () => void;
}

const ParticipantList = ({ conference, onBack }: ParticipantListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const participants = mockParticipants.filter((participant) => participant.confId === conference.id);
  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.org.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onBack} className="transition-colors hover:text-blue-600">
          รายการประชุม
        </button>
        <span>/</span>
        <span className="max-w-xs truncate font-medium text-gray-900">{conference.title}</span>
      </nav>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="mt-1 rounded-full p-2 transition-colors hover:bg-gray-100"
              aria-label="Back to conference list"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{conference.title}</h2>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                <DateDisplay startDate={conference.date} endDate={conference.endDate} iconSize={14} />
                <div className="flex items-center gap-1">
                  <MapPin size={14} /> {conference.location}
                </div>
                <StatusBadge status={conference.status} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-right">
            <span className="block text-xs font-semibold uppercase tracking-wide text-blue-600">ยอดลงทะเบียน</span>
            <span className="text-2xl font-bold text-blue-800">{conference.registered} คน</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ หน่วยงาน..."
              className="w-full rounded-lg border border-gray-300 px-10 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:flex-none"
            >
              Export Excel
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:flex-none"
            >
              <UserPlus size={16} /> เพิ่มชื่อ
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4">หน่วยงาน / ตำแหน่ง</th>
                <th className="px-6 py-4">ข้อมูลติดต่อ</th>
                <th className="px-6 py-4">วันที่ลงทะเบียน</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="transition-colors hover:bg-blue-50/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{participant.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{participant.org}</div>
                      <div className="text-xs text-gray-500">{participant.position}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span>{participant.email}</span>
                        <span className="text-xs text-gray-400">{participant.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{participant.regDate}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={participant.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" className="p-1 text-gray-400 transition-colors hover:text-blue-600">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <p>ไม่พบข้อมูลผู้ลงทะเบียน</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 text-sm text-gray-500">
          <span>
            แสดง {filteredParticipants.length} รายการ จากทั้งหมด {participants.length} รายการ
          </span>
          <div className="flex gap-2">
            <button type="button" className="rounded border bg-white px-3 py-1 text-sm text-gray-400" disabled>
              ก่อนหน้า
            </button>
            <button type="button" className="rounded border bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
              ถัดไป
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function Home() {
  const [view, setView] = useState<"list" | "participants">("list");
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regModalConference, setRegModalConference] = useState<Conference | null>(null);

  const handleSelectConference = (conference: Conference) => {
    setSelectedConference(conference);
    setView("participants");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setView("list");
    setSelectedConference(null);
  };

  const openRegistrationModal = (conference: Conference) => {
    setRegModalConference(conference);
    setIsRegModalOpen(true);
  };

  const closeRegistrationModal = () => {
    setIsRegModalOpen(false);
    setTimeout(() => setRegModalConference(null), 200);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main>
        {view === "list" || !selectedConference ? (
          <ConferenceList onSelect={handleSelectConference} onRegisterClick={openRegistrationModal} />
        ) : (
          <ParticipantList conference={selectedConference} onBack={handleBack} />
        )}
      </main>
      <RegistrationModal isOpen={isRegModalOpen} onClose={closeRegistrationModal} conference={regModalConference} />
    </div>
  );
}
