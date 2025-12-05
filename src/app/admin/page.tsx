'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, StatusBadge, DateDisplay } from '../_components/event-ui';
import type { Event, Participant } from '../_data/database';

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);

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
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">รายชื่อ</th>
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
                        <button
                          type="button"
                          onClick={async () => {
                            setSelectedEvent(event);
                            setLoadingParticipants(true);
                            setParticipantsError(null);
                            try {
                              const res = await fetch(`/api/events/${event.id}`);
                              const data = await res.json();
                              if (!res.ok || !data?.event?.participants) {
                                throw new Error('ไม่สามารถโหลดรายชื่อได้');
                              }
                              setParticipants(data.event.participants as Participant[]);
                            } catch (e: any) {
                              setParticipants([]);
                              setParticipantsError(e?.message ?? 'ไม่สามารถโหลดรายชื่อได้');
                            } finally {
                              setLoadingParticipants(false);
                            }
                          }}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                        >
                          ดูรายชื่อ
                        </button>
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

      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-stretch md:items-center justify-center">
          <div className="bg-white w-full h-full md:h-[90vh] md:w-[90vw] rounded-none md:rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">รายชื่อผู้เข้าร่วม</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedEvent.title} (ID: {selectedEvent.id})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const headers = ['name', 'org', 'position', 'email', 'phone', 'status', 'regDate', 'foodType'];
                    const csv = [
                      headers.join(','),
                      ...participants.map((p) =>
                        [
                          p.name,
                          p.org,
                          p.position,
                          p.email,
                          p.phone,
                          p.status,
                          p.regDate,
                          (p as any).foodType ?? '',
                        ]
                          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
                          .join(','),
                      ),
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `participants-${selectedEvent.id}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
                  disabled={loadingParticipants || participants.length === 0}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null);
                    setParticipants([]);
                    setParticipantsError(null);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                >
                  ปิด
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {loadingParticipants && <p className="text-sm text-gray-600">กำลังโหลดรายชื่อ...</p>}
              {participantsError && <p className="text-sm text-red-600">{participantsError}</p>}
              {!loadingParticipants && !participantsError && (
                <div className="overflow-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2">ชื่อ-นามสกุล</th>
                        <th className="px-3 py-2">หน่วยงาน</th>
                        <th className="px-3 py-2">ตำแหน่ง</th>
                        <th className="px-3 py-2">อีเมล</th>
                        <th className="px-3 py-2">โทร</th>
                        <th className="px-3 py-2">สถานะ</th>
                        <th className="px-3 py-2">ลงทะเบียน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {participants.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                            ไม่พบรายชื่อผู้เข้าร่วม
                          </td>
                        </tr>
                      ) : (
                        participants.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{p.name}</td>
                            <td className="px-3 py-2">{p.org}</td>
                            <td className="px-3 py-2">{p.position}</td>
                            <td className="px-3 py-2">{p.email}</td>
                            <td className="px-3 py-2">{p.phone}</td>
                            <td className="px-3 py-2">{p.status}</td>
                            <td className="px-3 py-2">{p.regDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
