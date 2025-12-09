'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '../_components/event-ui';
import type { Event } from '../_data/database';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const TH_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const TH_MONTHS_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function formatThaiDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(trimmed);
  if (!isoMatch) return trimmed;

  const year = Number(isoMatch[1]);
  const month = Number(isoMatch[2]);
  const day = Number(isoMatch[3]);
  if (!year || !month || !day || month < 1 || month > 12) return trimmed;

  const buddhistYear = year + 543;
  const monthName = TH_MONTHS_SHORT[month - 1];
  const dayStr = String(day).padStart(2, '0');
  const yearShort = String(buddhistYear).slice(-2);

  return `${dayStr} ${monthName} ${yearShort}`;
}

function parseDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export default function EventCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalEvents, setModalEvents] = useState<Event[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch('/api/events', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to load events');
        }
        const data = await res.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError('ไม่สามารถโหลดไทม์ไลน์กิจกรรมได้');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((evt) => {
      if (!evt.beginDate) return;
      if (!map[evt.beginDate]) map[evt.beginDate] = [];
      map[evt.beginDate].push(evt);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.id - b.id),
    );
    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const leading = start.getDay(); // Sunday=0
    const days: { day: number; dateKey: string | null }[] = [];

    for (let i = 0; i < leading; i++) {
      days.push({ day: 0, dateKey: null });
    }
    for (let d = 1; d <= end.getDate(); d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateKey });
    }
    return days;
  }, [month, year]);

  const monthTitle = `${TH_MONTHS_FULL[month]} ${year + 543}`;

  const shiftMonth = (delta: number) => {
    const newDate = new Date(year, month + delta, 1);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ปฏิทินกิจกรรม</h1>
            <p className="text-sm text-gray-600">ดูวันเริ่มกิจกรรมในรูปแบบปฏิทินเดือน</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-2 rounded-lg border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50"
              aria-label="เดือนก่อนหน้า"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-sm font-semibold text-emerald-800">{monthTitle}</div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="p-2 rounded-lg border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-500">กำลังโหลดข้อมูลไทม์ไลน์...</div>}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && calendarDays.every((d) => !d.dateKey || !eventsByDate[d.dateKey]) && (
          <div className="text-sm text-gray-500">ยังไม่มีกิจกรรมในระบบ</div>
        )}

        {!loading && !error && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-3">
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d) => (
                <div key={d} className="text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map(({ day, dateKey }, idx) => {
                const dayEvents = dateKey ? eventsByDate[dateKey] ?? [] : [];
                const colorClasses = [
                  'bg-emerald-50 text-emerald-800 border-emerald-200',
                  'bg-lime-50 text-lime-800 border-lime-200',
                  'bg-teal-50 text-teal-800 border-teal-200',
                  'bg-amber-50 text-amber-800 border-amber-200',
                  'bg-green-50 text-green-800 border-green-200',
                ];
                return (
                  <div
                    key={`${dateKey ?? 'blank'}-${idx}`}
                    className={`min-h-[96px] rounded-lg border ${
                      day ? 'border-gray-200 bg-slate-50' : 'border-dashed border-gray-100 bg-white'
                    } p-2 flex flex-col gap-1`}
                  >
                    <div className="text-sm font-semibold text-gray-800">{day || ''}</div>
                    {dayEvents.slice(0, 3).map((evt, index) => (
                      <a
                        key={evt.id}
                        href={`/poster?eventId=${evt.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block text-[10px] font-medium ${colorClasses[index % colorClasses.length]} rounded px-1.5 py-0.5 line-clamp-2`}
                        title={evt.title}
                      >
                        <div className="flex items-start gap-1.5 text-[11px] font-semibold text-gray-900 leading-snug">
                          <span className="text-emerald-500 leading-none">•</span>
                          <span className="line-clamp-2">{evt.title}</span>
                        </div>
                      </a>
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalDate(dateKey);
                          setModalEvents(dayEvents);
                        }}
                        className="text-[11px] text-emerald-700 font-medium hover:underline text-left"
                      >
                        +{dayEvents.length - 3} more..
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {modalDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-900">{formatThaiDate(modalDate)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalDate(null);
                    setModalEvents([]);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ปิด
                </button>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {modalEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500 text-lg leading-none">•</span>
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-gray-900">{evt.title}</div>
                        {evt.time && <div className="text-xs text-gray-600">{evt.time}</div>}
                        {evt.location && <div className="text-xs text-gray-500 line-clamp-2">{evt.location}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
