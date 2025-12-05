'use client';

// TEAM_001: Home page showing event list, split from prototype UI.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, EventCards } from './_components/event-ui';
import type { Event } from './_data/database';

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

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

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: Event[] = [];
    const past: Event[] = [];

    events.forEach((event) => {
      const eventDate = new Date(event.beginDate);
      if (!Number.isNaN(eventDate.getTime()) && eventDate < today) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });

    const sortAsc = (a: Event, b: Event) => {
      const da = new Date(a.beginDate).getTime();
      const db = new Date(b.beginDate).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return da - db || a.id - b.id;
    };

    upcoming.sort(sortAsc);
    past.sort(sortAsc);

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const displayedEvents = showPast ? pastEvents : upcomingEvents;
  const hasNoEvents = !loading && !error && displayedEvents.length === 0;

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
          <>
            <div className="max-w-7xl mx-auto px-6 pt-4 pb-0 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPast(false)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors mb-[5px] ${
                    showPast
                      ? 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                      : 'bg-emerald-600 text-white border-emerald-600'
                  }`}
                >
                  กำลังจะมาถึง ({upcomingEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowPast(true)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors mb-[5px] ${
                    showPast
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  กิจกรรมที่ผ่านมาแล้ว ({pastEvents.length})
                </button>
              </div>
              <a
                href="/calendar"
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-200 text-emerald-700 bg-white hover:border-emerald-400 hover:text-emerald-800 shadow-sm"
              >
                ปฏิทิน
              </a>
            </div>

            {hasNoEvents ? (
              <div className="p-6 max-w-7xl mx-auto text-gray-500 text-sm">
                {showPast ? 'ยังไม่มีกิจกรรมที่ผ่านมา' : 'ยังไม่มีกิจกรรมที่กำลังจะมาถึง'}
              </div>
            ) : (
              <EventCards
                events={displayedEvents}
                onRegisterClick={(event) => router.push(`/register?eventId=${event.id}`)}
                onViewParticipants={(event) => router.push(`/participants?eventId=${event.id}`)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
