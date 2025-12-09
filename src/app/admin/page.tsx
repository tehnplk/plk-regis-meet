'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, StatusBadge, DateDisplay } from '../_components/event-ui';
import type { Event, Participant } from '../_data/database';
import { getJWTToken } from '@/lib/auth';
import { useSession } from 'next-auth/react';
import { Check, Pencil, Trash2, X, MapPin, Clock3, FileText, AlignLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function AdminEventsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [savingParticipant, setSavingParticipant] = useState(false);

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
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch('/api/events', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to load events');
        }
        const data = await res.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
        setError(null);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError('ไม่สามารถโหลดรายการกิจกรรมได้');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [session]);

  const loadParticipants = async (eventId: number) => {
    setLoadingParticipants(true);
    setParticipantsError(null);
    try {
      const token = await getJWTToken();
      if (!token) {
        throw new Error('ต้องมี JWT เพื่อดึงรายชื่อ');
      }
      const res = await fetch(`/api/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('ไม่สามารถโหลดรายชื่อได้');
      }
      const data = await res.json();
      setParticipants(data.participants as Participant[]);
    } catch (e: any) {
      setParticipants([]);
      setParticipantsError(e?.message ?? 'ไม่สามารถโหลดรายชื่อได้');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const openParticipantsModal = async (event: Event) => {
    setSelectedEvent(event);
    setShowParticipantsModal(true);
    await loadParticipants(event.id);
  };


  const updateParticipant = async (updated: Partial<Participant> & { id: number }) => {
    if (!selectedEvent) return;
    setSavingParticipant(true);
    setParticipantsError(null);
    try {
      const token = await getJWTToken();
      if (!token) throw new Error('ต้องมี JWT');

      const body = {
        participantId: updated.id,
        name: updated.name,
        org: updated.org,
        position: updated.position,
        email: updated.email,
        phone: updated.phone,
        foodType: updated.foodType,
        status: updated.status,
      };

      const res = await fetch(`/api/events/${selectedEvent.id}/participants`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error('บันทึกไม่สำเร็จ');
      }
      await loadParticipants(selectedEvent.id);
    } catch (e: any) {
      setParticipantsError(e?.message ?? 'บันทึกไม่สำเร็จ');
    } finally {
      setSavingParticipant(false);
    }
  };

  const deleteParticipant = async (participantId: number) => {
    if (!selectedEvent) return;
    setSavingParticipant(true);
    setParticipantsError(null);
    try {
      const token = await getJWTToken();
      if (!token) throw new Error('ต้องมี JWT');
      const res = await fetch(`/api/events/${selectedEvent.id}/participants`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId }),
      });
      if (!res.ok) {
        throw new Error('ลบไม่สำเร็จ');
      }
      await loadParticipants(selectedEvent.id);
    } catch (e: any) {
      setParticipantsError(e?.message ?? 'ลบไม่สำเร็จ');
    } finally {
      setSavingParticipant(false);
    }
  };

  const filteredEvents =
    showOnlyMine && providerId
      ? events.filter((e) => (e.providerIdCreated ?? '') === String(providerId))
      : events;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mt-1">
              รายการกิจกรรม
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label
              className={`flex items-center gap-2 text-sm font-medium ${
                !providerId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={
                providerId
                  ? 'แสดงเฉพาะกิจกรรมที่คุณสร้าง'
                  : 'ไม่พบ provider_id ใน session กรุณาเข้าสู่ระบบใหม่'
              }
            >
              <span>เฉพาะของฉัน</span>
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showOnlyMine ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={showOnlyMine}
                  onChange={() => setShowOnlyMine((prev) => !prev)}
                  disabled={!providerId}
                />
                <span
                  className={`ml-[2px] inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    showOnlyMine ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </label>
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
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">วันที่</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">ชื่อกิจกรรม</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">ลงทะเบียนแล้ว</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">รายชื่อ</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">สถานะ</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">เอกสาร</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {showOnlyMine ? 'ไม่มีกิจกรรมที่คุณสร้าง' : 'ยังไม่มีกิจกรรมในระบบ'}
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 align-top text-gray-700 whitespace-nowrap">
                        <DateDisplay startDate={event.beginDate} endDate={event.beginDate} iconSize={14} />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <a
                          href={`/poster?eventId=${event.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-700 hover:underline text-left flex items-center gap-1"
                          title="เปิดโปสเตอร์กิจกรรม (แท็บใหม่)"
                        >
                          <FileText className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="line-clamp-2">{event.title}</span>
                        </a>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-start gap-1">
                          <AlignLeft className="mt-0.5 h-3 w-3 text-gray-400 shrink-0" />
                          <span className="max-w-md whitespace-normal break-words">{event.description}</span>
                        </div>
                        <div className="mt-0.5 space-y-0 text-[11px] text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="mt-0.5 h-3 w-3 text-emerald-500" />
                            <div>
                              <span className="whitespace-normal break-words">{event.location}</span>
                              {event.latitude != null && event.longitude != null && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-[10px] text-blue-600 hover:underline"
                                >
                                  [แผนที่]
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-1">
                            <DateDisplay startDate={event.beginDate} endDate={event.endDate} iconSize={12} />
                            {event.time && (
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3 w-3 text-emerald-500" />
                                <span>{event.time}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top text-gray-700">
                        <span className="font-semibold text-gray-900">{event.registered}</span>
                        <span className="text-gray-500"> / {event.capacity}</span>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => openParticipantsModal(event)}
                          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 focus:outline-none"
                        >
                          รายชื่อ
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
                        {(() => {
                          const isOwner =
                            providerId &&
                            (event.providerIdCreated ?? '') === String(providerId);
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                if (!isOwner) return;
                                router.push(`/create-event?eventId=${event.id}`);
                              }}
                              disabled={!isOwner}
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                isOwner
                                  ? 'border-blue-500 text-blue-600 hover:bg-blue-50'
                                  : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                              }`}
                              title={
                                isOwner
                                  ? 'แก้ไขกิจกรรม'
                                  : 'แก้ไขได้เฉพาะผู้สร้าง (provider_id ตรงกัน)'
                              }
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ParticipantsModal
        open={showParticipantsModal}
        onClose={() => {
          setShowParticipantsModal(false);
          setSelectedEvent(null);
          setParticipants([]);
          setParticipantsError(null);
        }}
        event={selectedEvent}
        participants={participants}
        loading={loadingParticipants}
        error={participantsError}
        onUpdate={updateParticipant}
        onDelete={deleteParticipant}
        saving={savingParticipant}
      />
    </div>
  );
}

// Participants modal UI
function ParticipantsModal({
  open,
  onClose,
  event,
  participants,
  loading,
  error,
  onUpdate,
  onDelete,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  participants: Participant[];
  loading: boolean;
  error: string | null;
  onUpdate: (p: Partial<Participant> & { id: number }) => Promise<void> | void;
  onDelete: (id: number) => void;
  saving: boolean;
}) {
  if (!open || !event) return null;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Participant>>({});
  const FOOD_LABELS: Record<string, string> = {
    normal: 'ทั่วไป',
    islam: 'อิสลาม',
  };

  const startEdit = (p: Participant) => {
    setEditingId(p.id);
    setDraft({ ...p });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const handleFieldChange = (field: keyof Participant, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingId) return;
    await onUpdate({ id: editingId, ...draft });
    cancelEdit();
  };

  const confirmDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'ต้องการลบผู้เข้าร่วมคนนี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
      });
      if (!result.isConfirmed) return;
    } catch {
      const ok = typeof window !== 'undefined' && window.confirm('ต้องการลบผู้เข้าร่วมคนนี้หรือไม่?');
      if (!ok) return;
    }

    onDelete(id);
  };

  const handleExportExcel = () => {
    if (!participants || participants.length === 0) {
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-6 overflow-auto">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">รายชื่อผู้เข้าร่วม</p>
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              ปิด
            </button>
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="border border-gray-200 rounded-lg overflow-hidden mt-3">
            <div className="bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>รายชื่อ ({participants.length})</span>
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-2 py-1 text-xs rounded-md border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={participants.length === 0 || loading}
              >
                ส่งออก Excel
              </button>
            </div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-14 text-center">ลำดับ</div>
                <div className="flex-1">ชื่อ-สกุล / ตำแหน่ง</div>
                <div className="w-48">หน่วยงาน</div>
                <div className="w-48">โทรศัพท์ / อีเมล</div>
                <div className="w-24 text-center">อาหาร</div>
                <div className="w-24 text-center">สถานะ</div>
                <div className="w-28 text-right">การจัดการ</div>
              </div>
            </div>
            <div className="max-h-[420px] overflow-auto divide-y divide-gray-100">
              {loading ? (
              <div className="p-3 text-sm text-gray-500">กำลังโหลด...</div>
            ) : participants.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">ยังไม่มีผู้เข้าร่วม</div>
            ) : (
              [...participants]
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
                })
                .map((p, idx) => {
                  const isEditing = editingId === p.id;
                  const current = isEditing ? { ...p, ...draft } : p;
                  return (
                    <div key={p.id} className="p-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-14 text-center pt-1 text-gray-700">{idx + 1}</div>

                        <div className="flex-1 space-y-1">
                          <div className="font-semibold text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
                                value={current.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                              />
                            ) : (
                              current.name
                            )}
                          </div>
                          <div className="text-gray-700 text-sm">
                            {isEditing ? (
                              <input
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
                                value={current.position}
                                onChange={(e) => handleFieldChange('position', e.target.value)}
                              />
                            ) : (
                              current.position || '-'
                            )}
                          </div>
                        </div>

                        <div className="w-48 text-sm text-gray-700">
                          {isEditing ? (
                            <input
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
                              value={current.org}
                              onChange={(e) => handleFieldChange('org', e.target.value)}
                            />
                          ) : (
                            current.org || '-'
                          )}
                        </div>

                        <div className="w-48 space-y-1 text-xs text-gray-700">
                          <div>
                            {isEditing ? (
                              <input
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs"
                                value={current.phone}
                                onChange={(e) => handleFieldChange('phone', e.target.value)}
                              />
                            ) : (
                              current.phone || '-'
                            )}
                          </div>
                          <div>
                            {isEditing ? (
                              <input
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs"
                                value={current.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                              />
                            ) : (
                              current.email || '-'
                            )}
                          </div>
                        </div>

                        <div className="w-24 text-xs text-gray-700 text-center">
                          {isEditing ? (
                            <select
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs"
                              value={current.foodType ?? 'normal'}
                              onChange={(e) => handleFieldChange('foodType', e.target.value)}
                            >
                              <option value="normal">ทั่วไป</option>
                              <option value="islam">อิสลาม</option>
                            </select>
                          ) : (
                            FOOD_LABELS[current.foodType ?? ''] ?? '-'
                          )}
                        </div>

                        <div className="w-24 text-xs text-gray-700 text-center">
                          {isEditing ? (
                            <select
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs"
                              value={current.status}
                              onChange={(e) => handleFieldChange('status', e.target.value)}
                            >
                              <option value="confirmed">confirmed</option>
                              <option value="pending">pending</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          ) : (
                            current.status
                          )}
                        </div>

                        <div className="w-28 flex items-start justify-end gap-2 text-xs">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                className="p-1.5 rounded-md border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                                disabled={saving}
                                onClick={handleSave}
                                title="บันทึก"
                                aria-label="บันทึก"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="p-1.5 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                                onClick={cancelEdit}
                                title="ยกเลิก"
                                aria-label="ยกเลิก"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="p-1.5 rounded-md border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-blue-600"
                              onClick={() => startEdit(p)}
                              title="แก้ไข"
                              aria-label="แก้ไข"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {!isEditing && (
                            <button
                              type="button"
                              className="p-1.5 rounded-md border border-gray-200 hover:border-red-200 hover:bg-red-50 text-red-600"
                              onClick={() => void confirmDelete(p.id)}
                              disabled={saving}
                              title="ลบ"
                              aria-label="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
