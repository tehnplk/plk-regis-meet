'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, StatusBadge, DateDisplay } from '../_components/event-ui';
import type { Event } from '../_data/database';

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) {
          throw new Error('Failed to load events');
        }
        const data = await res.json();
        setEvents(data.events ?? []);
        setError(null);
      } catch (e) {
        setError('ไม่สามารถโหลดรายการกิจกรรมได้');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">จัดการกิจกรรม (Admin)</h2>
            <p className="text-gray-500 text-sm mt-1">
              ตารางรายการกิจกรรมทั้งหมด สามารถคลิกแก้ไขแต่ละรายการได้
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-gray-500 text-sm">กำลังโหลดรายการกิจกรรม...</div>
        )}
        {!loading && error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">ชื่อกิจกรรม</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">วันที่</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">เวลา</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">สถานที่</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">ลงทะเบียนแล้ว / ทั้งหมด</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">สถานะ</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">ลิงก์เอกสาร</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      ยังไม่มีกิจกรรมในระบบ
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 align-top text-gray-700">{event.id}</td>
                      <td className="px-4 py-2 align-top">
                        <div className="font-medium text-gray-900 line-clamp-2">{event.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {event.description}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top text-gray-700">
                        <DateDisplay startDate={event.date} endDate={event.endDate} iconSize={14} />
                      </td>
                      <td className="px-4 py-2 align-top text-gray-700">{event.time}</td>
                      <td className="px-4 py-2 align-top text-gray-700 max-w-xs">
                        <div className="truncate" title={event.location}>
                          {event.location}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top text-gray-700">
                        {event.registered} / {event.capacity}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-4 py-2 align-top text-gray-700">
                        {event.docLink ? (
                          <a
                            href={event.docLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            เปิดลิงก์
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/create-event?eventId=${event.id}`)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
