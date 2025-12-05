'use client';

// TEAM_001: Simple create-event page (placeholder UI for future implementation).

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Event } from '../_data/database';
import { Header } from '../_components/event-ui';
import { EventForm } from '../_components/event-form';

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const eventIdParam = searchParams.get('eventId');
  const eventId = eventIdParam ? Number(eventIdParam) : undefined;
  const isEdit = !!eventId;

  const [initialEvent, setInitialEvent] = useState<Event | undefined>();
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const providerId = useMemo(() => {
    const rawProfile = (session?.user as any)?.profile as string | undefined;
    if (!rawProfile) return null;
    try {
      const profile = JSON.parse(rawProfile) as any;
      return profile?.provider_id ?? profile?.providerId ?? null;
    } catch {
      return null;
    }
  }, [session]);

  useEffect(() => {
    if (!isEdit || !eventId) {
      setLoading(false);
      return;
    }

    if (sessionStatus === 'loading') {
      return;
    }

    if (!providerId) {
      setError('ไม่มีสิทธิ์แก้ไขกิจกรรมนี้');
      setInitialEvent(undefined);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.status === 404) {
          setError('ไม่พบกิจกรรมที่ต้องการ');
          setInitialEvent(undefined);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load event');
        }
        const data = await res.json();
        const fetched = data.event as Event;
        const ownerId = (fetched as any)?.providerIdCreated ?? '';
        if (String(ownerId) !== String(providerId)) {
          setError('ไม่มีสิทธิ์แก้ไขกิจกรรมนี้');
          setInitialEvent(undefined);
          return;
        }
        setInitialEvent(fetched);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, eventId, providerId, sessionStatus]);

  const title = isEdit ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่';
  const description = isEdit
    ? 'หน้าสำหรับแก้ไขรายละเอียดกิจกรรมที่มีอยู่'
    : 'หน้านี้สำหรับสร้างกิจกรรมใหม่ และจัดเก็บข้อมูลลงฐานข้อมูล.';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>

        {loading && (
          <div className="text-gray-500 text-sm">กำลังโหลดข้อมูลกิจกรรม...</div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (!isEdit || initialEvent) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <EventForm
              mode={isEdit ? 'edit' : 'create'}
              eventId={eventId}
              initialEvent={initialEvent}
              onSuccess={(savedEvent) => {
                const message = isEdit
                  ? 'บันทึกการแก้ไขกิจกรรมสำเร็จ'
                  : 'สร้างกิจกรรมสำเร็จ';
                setToastMessage(message);

                const target = isEdit ? '/admin' : '/';
                setTimeout(() => router.push(target), 1200);
              }}
              onCancel={() => router.back()}
            />
          </div>
        )}
      </main>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-lg bg-emerald-600 text-white shadow-lg px-4 py-3 text-sm font-medium">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
