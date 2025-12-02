'use client';

// TEAM_001: Home page showing event list, split from prototype UI.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, EventCards } from './_components/event-ui';
import type { Event } from './_data/database';

export default function HomePage() {
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
        setError('ไม่สามารถโหลดรายการงานได้');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main>
        {loading && (
          <div className="p-6 max-w-7xl mx-auto text-gray-500 text-sm">กำลังโหลดรายการงาน...</div>
        )}
        {!loading && error && (
          <div className="p-6 max-w-7xl mx-auto text-red-500 text-sm">{error}</div>
        )}
        {!loading && !error && (
          <EventCards
            events={events}
            onRegisterClick={(event) => router.push(`/register?eventId=${event.id}`)}
            onViewParticipants={(event) => router.push(`/participants?eventId=${event.id}`)}
          />
        )}
      </main>
    </div>
  );
}
