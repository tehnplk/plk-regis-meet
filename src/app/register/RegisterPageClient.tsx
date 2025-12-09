'use client';

// TEAM_001: Standalone registration page client component split from prototype modal.

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header, RegistrationForm } from '../_components/event-ui';
import type { Event } from '../_data/database';

export default function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  const eventId = eventIdParam ? Number(eventIdParam) : undefined;

  const [event, setEvent] = useState<Event | undefined>();
  const [loading, setLoading] = useState<boolean>(!!eventId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
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
        setError('no data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">ลงทะเบียนเข้าร่วมงาน</h2>
        {loading && (
          <p className="text-gray-600 text-sm">กำลังโหลดข้อมูลงาน...</p>
        )}
        {!loading && error && (
          <p className="text-gray-600 text-sm">{error}</p>
        )}
        {!loading && !error && event && (
          <p className="text-gray-600 text-sm">สำหรับกิจกรรม: {event.title}</p>
        )}
        <RegistrationForm
          eventId={eventId}
          eventTitle={event?.title}
          onSubmitted={() => router.push(eventId ? `/poster?eventId=${eventId}` : '/')}
        />
      </main>
    </div>
  );
}
