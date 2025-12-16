'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RegistrationForm, formatThaiDate } from '../../_components/event-ui';
import type { Event } from '../../_data/database';
import { getJWTToken } from '@/lib/auth';
import { AlertTriangle } from 'lucide-react';

type InitialProfile = {
  name?: string;
  org?: string;
  position?: string;
  email?: string;
  phone?: string;
};

export default function RegisterByFormPageClient({
  initialProfile,
}: {
  initialProfile?: InitialProfile;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  const eventId = eventIdParam ? Number(eventIdParam) : undefined;

  const [event, setEvent] = useState<Event | undefined>();
  const [loading, setLoading] = useState<boolean>(!!eventId);
  const [error, setError] = useState<string | null>(null);

  const isPastEvent = (() => {
    const e = event;
    if (!e) return false;
    const endText = (e.endDate && e.endDate.trim() !== '' ? e.endDate : e.beginDate).trim();
    const endDate = endText ? new Date(endText) : null;
    if (!endDate || Number.isNaN(endDate.getTime())) return false;
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    return Date.now() > endOfDay.getTime();
  })();

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const token = await getJWTToken();
        if (!token) {
          throw new Error('auth required');
        }
        const res = await fetch(`/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) {
          setEvent(undefined);
          setError('ไม่พบกิจกรรมที่ต้องการ');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load event');
        }
        const data = await res.json();
        setEvent(data.event as Event);
        setError(null);
      } catch (e) {
        setError('ไม่สามารถโหลดข้อมูลกิจกรรม (โปรดเข้าสู่ระบบใหม่)');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        {loading && (
          <p className="text-gray-600 text-sm">กำลังโหลดข้อมูลงาน...</p>
        )}
        {!loading && error && (
          <p className="text-gray-600 text-sm">{error}</p>
        )}
        {!loading && !error && event && (
          <div className="space-y-3">
            <p className="text-lg md:text-xl font-bold text-emerald-900">
              กิจกรรม: {event.title}
            </p>
            {Boolean(event.regis_closed) || Boolean(event.status === 'full' || event.registered >= event.capacity) || isPastEvent ? (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-start gap-2 text-sm text-rose-700">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>กิจกรรมนี้ปิดรับลงทะเบียนแล้ว</span>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">วันที่ / เวลา</p>
                <p className="text-sm text-gray-900 mt-1">
                  {event.beginDate
                    ? event.endDate && event.endDate !== event.beginDate
                      ? `${formatThaiDate(event.beginDate)} - ${formatThaiDate(event.endDate)}`
                      : formatThaiDate(event.beginDate)
                    : '-'}
                  {event.time ? ` เวลา ${event.time}` : ''}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">สถานที่</p>
                <p className="text-sm text-gray-900 mt-1">{event.location || '-'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:col-span-2 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">รายละเอียด / สิ่งที่ต้องเตรียม</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {event.description || '-'}
                </p>
                <div className="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2">
                  <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide">สิ่งที่ต้องเตรียม</p>
                  <p className="text-sm text-emerald-900 mt-1 break-words">{event.requiredItems || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <RegistrationForm
          eventId={eventId}
          eventTitle={event?.title}
          initialProfile={initialProfile}
          onSubmitted={() => router.push(eventId ? `/poster?eventId=${eventId}` : '/')}
          regisClosed={
            Boolean(event?.regis_closed) ||
            Boolean(event && (event.status === 'full' || event.registered >= event.capacity))
            || isPastEvent
          }
          needOriginApprovePaper={event?.needOriginApprovePaper}
          enableCheckInRadius={event?.enableCheckInRadius}
          checkInRadiusMeters={event?.checkInRadiusMeters}
          eventLatitude={event?.latitude}
          eventLongitude={event?.longitude}
          inputTextClassName="text-blue-700"
        />
      </main>
    </div>
  );
}
