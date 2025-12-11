'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import {
  AlertTriangle,
  Clock,
  FileText,
  MapPin,
  Search,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import type { EventStatus, Participant } from '../_data/database';
import { DateDisplay, StatusBadge } from '../_components/event-ui';
import { getJWTToken } from '@/lib/auth';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

type PosterEvent = {
  id: number;
  title: string;
  beginDate: string;
  endDate: string | null;
  time: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  registered: number;
  capacity: number;
  status: EventStatus;
  description: string | null;
  requiredItems: string | null;
  docLink: string | null;
  preTestLink?: string | null;
  posTestLink?: string | null;
  secretPass?: string | null;
};

const accentPalettes = [
  { border: 'border-emerald-200', gradient: 'from-emerald-500 via-lime-400 to-green-500' },
  { border: 'border-lime-200', gradient: 'from-lime-500 via-emerald-400 to-green-500' },
  { border: 'border-teal-200', gradient: 'from-teal-500 via-emerald-400 to-lime-500' },
  { border: 'border-amber-200', gradient: 'from-amber-500 via-lime-400 to-emerald-500' },
  { border: 'border-green-200', gradient: 'from-green-500 via-emerald-400 to-lime-500' },
];

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

function maskName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]} ***`;
  }
  const firstChar = trimmed[0] ?? '';
  return firstChar ? `${firstChar}***` : '';
}

function maskPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length <= 2) {
    return '*'.repeat(trimmed.length || 0);
  }
  return `${trimmed.slice(0, -2)}**`;
}

export default function PosterCardClient({ event }: { event: PosterEvent }) {
  const palette = accentPalettes[0];
  const isUnavailable = ['full', 'closed', 'cancelled', 'postponed'].includes(event.status);
  const progress = Math.min((event.registered / event.capacity) * 100, 100);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const qrValue = `${baseUrl}/poster?eventId=${event.id}`;
  const daysUntil = useMemo(() => getDaysUntil(event.beginDate), [event.beginDate]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!showParticipants) return;

    const load = async () => {
      setLoadingParticipants(true);
      try {
        const fetchWithToken = async (token: string) =>
          fetch(`/api/events/${event.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        let token = await getJWTToken();
        if (!token) {
          setParticipantsError('ต้องเข้าสู่ระบบเพื่อดูรายชื่อผู้เข้าร่วม');
          return;
        }

        let res = await fetchWithToken(token);

        // Retry once if auth failed (token expired/missing), try refresh/public token
        if (res.status === 401 || res.status === 403) {
          const retryToken = await getJWTToken();
          if (retryToken && retryToken !== token) {
            token = retryToken;
            res = await fetchWithToken(token);
          }
        }

        if (!res.ok) {
          throw new Error(`failed to load participants (${res.status})`);
        }

        const data = await res.json();
        setParticipants((data.event?.participants ?? []) as Participant[]);
        setParticipantsError(null);
      } catch (err) {
        console.error('[poster] participants fetch failed', err);
        setParticipantsError('โหลดรายชื่อไม่สำเร็จ (โปรดเข้าสู่ระบบ)');
      } finally {
        setLoadingParticipants(false);
      }
    };

    load();
  }, [event.id, showParticipants]);

  const filteredParticipants = participants.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.org.toLowerCase().includes(term) ||
      (p.email ?? '').toLowerCase().includes(term)
    );
  });

  const handleExportExcel = async () => {
    if (!participants || participants.length === 0) {
      return;
    }
    const rawSecret = (event.secretPass ?? '').trim();
    const secret = rawSecret === '' ? '12345678' : rawSecret;

    const result = await Swal.fire({
      title: 'กรอกรหัสผ่านสำหรับส่งออก',
      input: 'password',
      inputLabel: 'secretPass ของกิจกรรมนี้',
      inputPlaceholder: 'กรอกรหัสผ่าน',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    });

    if (!result.isConfirmed) {
      return;
    }

    const value = (result.value ?? '').trim();
    if (value !== secret) {
      await Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ถูกต้อง',
        text: 'ไม่สามารถส่งออกข้อมูลได้',
      });
      return;
    }

    const sorted = [...participants]
      .slice()
      .sort((a, b) => {
        const toTs = (p: Participant) => {
          const date = p.regDate ? new Date(p.regDate as any) : null;
          const time =
            p.regTime instanceof Date
              ? p.regTime
              : p.regTime
              ? new Date(`${p.regDate} ${p.regTime}`)
              : null;
          const ts = time?.getTime() ?? date?.getTime() ?? 0;
          return Number.isNaN(ts) ? 0 : ts;
        };
        return toTs(a) - toTs(b);
      });

    const FOOD_LABELS: Record<string, string> = {
      normal: 'ทั่วไป',
      islam: 'อิสลาม',
    };

    const rows = sorted.map((p, index) => ({
      ลำดับ: index + 1,
      ชื่อสกุล: p.name ?? '',
      ตำแหน่ง: p.position ?? '',
      หน่วยงาน: p.org ?? '',
      โทรศัพท์: p.phone ?? '',
      อีเมล: p.email ?? '',
      อาหาร: FOOD_LABELS[p.foodType ?? ''] ?? '',
      สถานะ: p.status ?? '',
      วันที่ลงทะเบียน: p.regDate ?? '',
      เวลาลงทะเบียน: (() => {
        if (!p.regTime) return '';
        const d =
          p.regTime instanceof Date
            ? p.regTime
            : new Date(p.regTime as any);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
        });
      })(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'participants');
    const safeTitle =
      event?.title?.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40) || 'participants';
    XLSX.writeFile(workbook, `${safeTitle}.xlsx`);
  };

  return (
    <>
      <article
        className={`bg-white rounded-xl shadow-sm border ${palette.border} overflow-hidden flex flex-col`}
      >
        <div className={`h-1 w-full bg-gradient-to-r ${palette.gradient}`} />
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-3">
            <StatusBadge status={event.status} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-500 shrink-0" />
            <span className="line-clamp-2">{event.title}</span>
          </h1>
          <p className="text-gray-700 text-base mb-5 whitespace-pre-line">{event.description}</p>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="text-base font-semibold text-gray-800">
              <DateDisplay startDate={event.beginDate} endDate={event.endDate} />
            </div>
          {daysUntil != null && daysUntil >= 0 && (
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-medium">
              <Clock size={14} className="text-amber-700" />
              <span>ถึงกำหนดในอีก {daysUntil} วัน</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-base">
            <Clock size={18} className="text-emerald-500 shrink-0" />
            <span className="font-semibold text-gray-900">{event.time}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-base">
              <MapPin size={18} className="text-emerald-500 shrink-0" />
              <span className="truncate font-semibold text-gray-900">{event.location}</span>
            </div>
            <a
              href={
                event.latitude != null && event.longitude != null
                  ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
                  : event.location
                  ? `https://www.google.com/maps?q=${encodeURIComponent(event.location)}`
                  : '#'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline ml-6 w-fit"
            >
              คลิกดูแผนที่
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">เอกสาร</span>
            {event.docLink ? (
              <a
                href={event.docLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                คลิกเพื่อดาวน์โหลดเอกสาร
              </a>
            ) : (
              <span className="text-gray-500">ไม่มี</span>
            )}
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1">
              สิ่งที่ต้องเตรียม
            </p>
            <p className="leading-relaxed break-words">{event.requiredItems || '-'}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
              <QRCode value={qrValue} size={96} />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">scan ลงทะเบียน</span>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs ml-auto">
            <a
              href={`/register?eventId=${event.id}`}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors shadow-sm ${
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
            </a>
            <button
              type="button"
              onClick={() => setShowParticipants(true)}
              className="w-full py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-emerald-600 transition-colors text-center cursor-pointer"
            >
              ดูรายชื่อ
            </button>
            {event.preTestLink && (
              <a
                href={event.preTestLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-white border border-emerald-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors text-center cursor-pointer"
              >
                Pre-test
              </a>
            )}
            {event.posTestLink && (
              <a
                href={event.posTestLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors text-center cursor-pointer"
              >
                Post-test
              </a>
            )}
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
                event.registered >= event.capacity ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </article>

    {showParticipants && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm text-gray-500">รายชื่อผู้ลงทะเบียน</p>
              <p className="text-base font-semibold text-gray-900">
                {event.title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-1.5 text-xs rounded-lg border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={participants.length === 0 || loadingParticipants}
              >
                ส่งออก Excel
              </button>
              <button
                type="button"
                onClick={() => setShowParticipants(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ หรือ หน่วยงาน..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[45vh] overflow-y-auto">
                {loadingParticipants ? (
                  <div className="p-4 text-sm text-gray-500">กำลังโหลดรายชื่อ...</div>
                ) : participantsError ? (
                  <div className="p-4 text-sm text-red-600">{participantsError}</div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
                    <Search size={16} className="text-gray-300" />
                    ไม่พบข้อมูลผู้ลงทะเบียน
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 w-12">ลำดับ</th>
                        <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3">ตำแหน่ง</th>
                        <th className="px-4 py-3">หน่วยงาน</th>
                        <th className="px-4 py-3">เบอร์โทร</th>
                        <th className="px-4 py-3 text-center">วันที่ลงทะเบียน</th>
                        <th className="px-4 py-3 text-center">เวลาลงทะเบียน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredParticipants.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{idx + 1}</td>
                          <td className="px-4 py-2 text-gray-900">{maskName(p.name)}</td>
                          <td className="px-4 py-2 text-gray-700">{p.position || '-'}</td>
                          <td className="px-4 py-2 text-gray-700">{p.org || '-'}</td>
                          <td className="px-4 py-2 text-gray-600">
                            {p.phone ? maskPhone(p.phone) : '-'}
                          </td>
                          <td className="px-4 py-2 text-center text-gray-500 text-xs">{p.regDate || '-'}</td>
                          <td className="px-4 py-2 text-center text-gray-500 text-xs">
                            {p.regTime ? new Date(p.regTime).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
