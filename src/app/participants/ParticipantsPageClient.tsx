'use client';

// TEAM_001: Participants page client component split from prototype UI.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, ParticipantsSection } from '../_components/event-ui';
import type { Event, Participant } from '../_data/database';

export default function ParticipantsPageClient() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  const eventId = eventIdParam ? Number(eventIdParam) : 1;

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setError('ไม่พบรหัสงานที่ต้องการ');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);

        if (res.status === 404) {
          setEvent(null);
          setParticipants([]);
          setError('ไม่พบกิจกรรมที่ต้องการ');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to load event');
        }

        const data = await res.json();
        setEvent(data.event as Event);
        setParticipants((data.event.participants ?? []) as Participant[]);
        setError(null);
      } catch (e) {
        console.error('[participants] load error', e);
        setError('ไม่สามารถโหลดข้อมูลผู้เข้าร่วมได้');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
        <Header />
        <main className="max-w-3xl mx-auto p-6">
          <p className="text-gray-600 text-sm">กำลังโหลดข้อมูลผู้เข้าร่วม...</p>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
        <Header />
        <main className="max-w-3xl mx-auto p-6">
          <p className="text-gray-600 text-sm">{error ?? 'ไม่พบกิจกรรมที่ต้องการ'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main>
        <ParticipantsSection event={event} participants={participants} />
      </main>
    </div>
  );
}
