'use client';

import { usePathname } from 'next/navigation';
import QRCode from 'react-qr-code';
import {
  Clock,
  FileText,
  MapPin,
  Maximize,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Event } from '../_data/database';
import { getDaysUntil } from './event-utils';
import { StatusBadge } from './StatusBadge';
import { DateDisplay } from './DateDisplay';

const accentPalettes = [
  { border: 'border-emerald-200', gradient: 'from-emerald-500 via-lime-400 to-green-500' },
  { border: 'border-lime-200', gradient: 'from-lime-500 via-emerald-400 to-green-500' },
  { border: 'border-teal-200', gradient: 'from-teal-500 via-emerald-400 to-lime-500' },
  { border: 'border-amber-200', gradient: 'from-amber-500 via-lime-400 to-emerald-500' },
  { border: 'border-green-200', gradient: 'from-green-500 via-emerald-400 to-lime-500' },
];

export const EventCards = ({
  events,
}: {
  events: Event[];
}) => {
  const pathname = usePathname();
  const showCreateButton = pathname !== '/';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {showCreateButton && (
        <div className="flex justify-end items-center">
          <a
            href="/admin/create-event"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus size={18} />
            <span>สร้างกิจกรรมใหม่</span>
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, idx) => {
          const palette = accentPalettes[idx % accentPalettes.length];
          const progress = Math.min((event.registered / event.capacity) * 100, 100);
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
          const qrValue = `${baseUrl}/poster?eventId=${event.id}`;
          const daysUntil = getDaysUntil(event.beginDate);
          const eventEndText = (event.endDate && event.endDate.trim() !== '' ? event.endDate : event.beginDate).trim();
          const eventEndDate = eventEndText ? new Date(eventEndText) : null;
          const isPastEvent = (() => {
            if (!eventEndDate || Number.isNaN(eventEndDate.getTime())) return false;
            const endOfDay = new Date(eventEndDate);
            endOfDay.setHours(23, 59, 59, 999);
            return Date.now() > endOfDay.getTime();
          })();

          const effectiveStatus =
            event.status === 'cancelled' || event.status === 'postponed' || event.status === 'closed'
              ? event.status
              : isPastEvent
              ? 'closed'
              : event.status;

          const isAutoFull = event.status === 'full' || event.registered >= event.capacity;
          const isRegisClosed = Boolean(event.regis_closed) || isAutoFull || isPastEvent;
          const showStatusBadge = ['scheduled', 'postponed', 'cancelled', 'closed'].includes(effectiveStatus);

          return (
            <div
              key={event.id}
              className={`bg-white rounded-xl shadow-sm border ${palette.border} hover:shadow-md transition-shadow overflow-hidden flex flex-col`}
            >
              <div className={`h-1 w-full bg-gradient-to-r ${palette.gradient}`} />
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {showStatusBadge && <StatusBadge status={effectiveStatus} />}
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        isRegisClosed
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {isRegisClosed ? 'ปิดรับลงทะเบียน' : 'เปิดรับลงทะเบียน'}
                    </span>
                  </div>
                  <a
                    href={`/poster?eventId=${event.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="เปิดโปสเตอร์กิจกรรม"
                  >
                    <Maximize size={20} />
                  </a>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="line-clamp-2">{event.title}</span>
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  <DateDisplay startDate={event.beginDate} endDate={event.endDate} />
                  {daysUntil != null && daysUntil >= 0 && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-medium">
                      <Clock size={14} className="text-amber-700" />
                      <span>ถึงกำหนดในอีก {daysUntil} วัน</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-emerald-500 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <a
                      href={
                        event.latitude != null && event.longitude != null
                          ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
                          : `https://www.google.com/maps?q=${encodeURIComponent(event.location)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline ml-6 w-fit cursor-pointer"
                    >
                      คลิกดูแผนที่
                    </a>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                      <QRCode value={qrValue} size={60} />
                    </div>
                    <span className="text-[9px] text-gray-500 font-medium">scan ลงทะเบียน</span>
                  </div>
                  <a
                    href={`/poster?eventId=${event.id}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm bg-blue-600 text-white hover:bg-blue-700 flex-1 cursor-pointer"
                  >
                    <UserPlus size={16} />
                    <span>{isRegisClosed ? 'ดูรายละเอียด' : 'คลิกลงทะเบียน'}</span>
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Users size={16} />
                    <span>
                      {event.registered} / {event.capacity} คน
                    </span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        event.registered >= event.capacity ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
