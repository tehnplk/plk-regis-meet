'use client';

import { useState, FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { useAppSession } from './app-session-context';
import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  CheckCircle,
  ChevronLeft,
  ChevronDown,
  Clock,
  MapPin,
  MoreHorizontal,
  Search,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import type {
  Event,
  EventStatus,
  Participant,
} from '../_data/database';
import { STATUS_LABELS } from '../_data/database';

const STATUS_STYLES: Record<EventStatus | 'confirmed' | 'pending' | 'cancelled', string> = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  open: 'bg-green-100 text-green-700 border-green-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  full: 'bg-orange-100 text-orange-700 border-orange-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  postponed: 'bg-purple-100 text-purple-700 border-purple-200',
};

const TH_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatThaiDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(trimmed);
  if (!isoMatch) {
    return trimmed;
  }

  const year = Number(isoMatch[1]);
  const month = Number(isoMatch[2]);
  const day = Number(isoMatch[3]);

  if (!year || !month || !day || month < 1 || month > 12) {
    return trimmed;
  }

  const buddhistYear = year + 543;
  const monthName = TH_MONTHS_SHORT[month - 1];
  const dayStr = String(day).padStart(2, '0');
  const yearShort = String(buddhistYear).slice(-2);

  return `${dayStr} ${monthName} ${yearShort}`;
}

function getDaysUntil(dateStr: string): number | null {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;

  const start = new Date(parsed);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = start.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userName } = useAppSession();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/auth/signout?callbackUrl=/';
    }
  };

  const displayName = userName ?? 'ผู้ใช้งาน';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 focus:outline-none"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">ย้อนกลับ</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">PLK-HEALTH Events</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {userName ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[160px] truncate text-gray-700">{displayName}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-red-600 hover:underline"
              >
                [ออกระบบ]
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="px-3 py-1.5 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              เข้าระบบ
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 

export const StatusBadge = ({ status }: { status: EventStatus | 'confirmed' | 'pending' | 'cancelled' }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      STATUS_STYLES[status] ?? STATUS_STYLES.closed
    }`}
  >
    {STATUS_LABELS[status] ?? status}
  </span>
);

export const DateDisplay = ({
  startDate,
  endDate,
  iconSize = 16,
}: {
  startDate: string;
  endDate: string | null;
  iconSize?: number;
}) => {
  const formattedStart = formatThaiDate(startDate);
  const formattedEnd = endDate ? formatThaiDate(endDate) : null;

  return (
    <div className="flex items-center gap-2">
      <Calendar size={iconSize} className="text-blue-500 shrink-0" />
      <span>
        {formattedStart}
        {formattedEnd && formattedEnd !== formattedStart ? ` - ${formattedEnd}` : ''}
      </span>
    </div>
  );
};

export const EventCards = ({
  events,
  onRegisterClick,
  onViewParticipants,
}: {
  events: Event[];
  onRegisterClick: (event: Event) => void;
  onViewParticipants: (event: Event) => void;
}) => {
  const pathname = usePathname();
  const showCreateButton = pathname !== '/';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {showCreateButton && (
        <div className="flex justify-end items-center">
          <a
            href="/create-event"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <UserPlus size={18} />
            <span>สร้างกิจกรรมใหม่</span>
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const isUnavailable = ['full', 'closed', 'cancelled', 'postponed'].includes(event.status);
          const progress = Math.min((event.registered / event.capacity) * 100, 100);
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
          const qrValue = `${baseUrl}/register?eventId=${event.id}`;
          const daysUntil = getDaysUntil(event.date);

          return (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <StatusBadge status={event.status} />
                  <button className="text-gray-400 hover:text-gray-600" type="button">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  <DateDisplay startDate={event.date} endDate={event.endDate} />
                  {daysUntil != null && daysUntil >= 0 && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-medium">
                      <Clock size={14} className="text-amber-700" />
                      <span>ถึงกำหนดในอีก {daysUntil} วัน</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-500 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <a
                      href={
                        event.latitude && event.longitude
                          ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 hover:underline ml-6 w-fit"
                    >
                      คลิกดูแผนที่
                    </a>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                      <QRCode value={qrValue} size={80} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">scan ลงทะเบียน</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => onRegisterClick(event)}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                        isUnavailable
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {event.status === 'cancelled' ? (
                        <XCircle size={16} />
                      ) : event.status === 'postponed' ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      <span>
                        {event.status === 'cancelled'
                          ? 'ยกเลิกแล้ว'
                          : event.status === 'postponed'
                          ? 'เลื่อน'
                          : event.status === 'full'
                          ? 'เต็ม'
                          : 'ลงทะเบียน'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewParticipants(event)}
                      className="py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      ดูรายชื่อ
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Users size={16} />
                    <span>
                      {event.registered} / {event.capacity} คน
                    </span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        event.registered >= event.capacity ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ParticipantsSection = ({
  event,
  participants,
}: {
  event: Event;
  participants: Participant[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.org.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <span className="text-gray-700">รายการกิจกรรม</span>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{event.title}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <DateDisplay startDate={event.date} endDate={event.endDate} iconSize={14} />
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {event.location}
                </span>
                <StatusBadge status={event.status} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-right px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="block text-xs text-blue-600 font-semibold uppercase tracking-wide">ยอดลงทะเบียน</span>
              <span className="text-2xl font-bold text-blue-800">{event.registered} คน</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ หน่วยงาน..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50" type="button">
              Export Excel
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2" type="button">
              <UserPlus size={16} /> เพิ่มชื่อ
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
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
                  <tr key={participant.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{participant.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{participant.org}</div>
                      <div className="text-xs text-gray-500">{participant.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-gray-600">
                        <span>{participant.email}</span>
                        <span className="text-gray-400 text-xs">{participant.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{participant.regDate}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={participant.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-blue-600 p-1" type="button">
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
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">
            แสดง {filteredParticipants.length} รายการ จากทั้งหมด {participants.length} รายการ
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded bg-white text-gray-400 text-sm disabled:opacity-50" disabled type="button">
              ก่อนหน้า
            </button>
            <button className="px-3 py-1 border rounded bg-white text-gray-600 text-sm hover:bg-gray-50" type="button">
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RegistrationForm = ({
  eventId,
  eventTitle,
  onSubmitted,
  initialProfile,
}: {
  eventId?: number;
  eventTitle?: string;
  onSubmitted?: () => void;
  initialProfile?: {
    name?: string;
    org?: string;
    position?: string;
    email?: string;
    phone?: string;
  };
}) => {
  const [phoneInput, setPhoneInput] = useState(initialProfile?.phone ?? '');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!eventId) {
      window.alert('ไม่พบรหัสงานสำหรับการลงทะเบียน');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const org = String(formData.get('org') ?? '').trim();
    const position = String(formData.get('position') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phoneRaw = String(formData.get('phone') ?? '').trim();
    const foodType = (formData.get('foodType') ?? '').toString() as 'normal' | 'islam' | '';

    const phone = phoneRaw.replace(/\D/g, '');

    if (!name || !org || !email || !phoneRaw) {
      window.alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (!/^0\d{9}$/.test(phone)) {
      setPhoneError('กรุณากรอกเบอร์ติดต่อ 10 หลัก ตามรูปแบบประเทศไทย เช่น 08 1234 5678');
      return;
    }

    if (!foodType) {
      window.alert('กรุณาเลือกประเภทอาหาร');
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          org,
          position,
          email,
          phone,
          foodType,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to register');
      }

      window.alert(
        eventTitle
          ? `ลงทะเบียนสำเร็จสำหรับงาน: ${eventTitle}`
          : 'ลงทะเบียนสำเร็จ',
      );
      onSubmitted?.();
    } catch (error) {
      console.error(error);
      window.alert('ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-w-lg mx-auto">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          ชื่อ-นามสกุล <span className="text-red-500">*</span>
        </label>
        <input
          required
          name="name"
          type="text"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
          placeholder="เช่น นายสมชาย มีมาก"
          defaultValue={initialProfile?.name}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            หน่วยงาน <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="org"
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="ส่วนราชการ/องค์กร"
            defaultValue={initialProfile?.org}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ตำแหน่ง</label>
          <input
            name="position"
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="ระบุตำแหน่ง"
            defaultValue={initialProfile?.position}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            อีเมล <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="email"
            type="email"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="name@example.com"
            defaultValue={initialProfile?.email}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            เบอร์ติดต่อ <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="phone"
            type="tel"
            maxLength={12}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="เช่น 08 1234 5678"
            value={phoneInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
              let formatted = raw;
              if (raw.length > 2 && raw.length <= 6) {
                formatted = `${raw.slice(0, 2)} ${raw.slice(2)}`;
              } else if (raw.length > 6) {
                formatted = `${raw.slice(0, 2)} ${raw.slice(2, 6)} ${raw.slice(6)}`;
              }
              setPhoneInput(formatted);

              if (phoneError) {
                if (!raw || /^0\d{9}$/.test(raw)) {
                  setPhoneError(null);
                }
              }
            }}
          />
          {phoneError && (
            <p className="mt-1 text-xs text-red-500">{phoneError}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-1.5">
            ประเภทอาหาร <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="foodType"
                value="normal"
                defaultChecked
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span>อาหารปกติ</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="foodType"
                value="islam"
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span>อาหารอิสลาม (ฮาลาล)</span>
            </label>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-700 mt-2 sm:mt-0">
          <CheckCircle size={14} className="mt-0.5 shrink-0" />
          <p>
            กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน ระบบจะส่งอีเมลยืนยันการลงทะเบียนไปยังอีเมลที่ท่านระบุไว้
          </p>
        </div>
      </div>

      <div className="pt-2 flex gap-3 justify-end border-t border-gray-100 mt-6">
        <button
          type="submit"
          className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm hover:shadow transition-all flex items-center gap-2 text-sm"
        >
          <UserPlus size={18} />
          ยืนยันการลงทะเบียน
        </button>
      </div>
    </form>
  );
};
