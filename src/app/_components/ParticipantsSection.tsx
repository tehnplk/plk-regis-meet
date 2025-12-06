'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  Clock,
  MapPin,
  MoreHorizontal,
  Search,
  UserPlus,
} from 'lucide-react';
import type { Event, Participant } from '../_data/database';
import { formatThaiDate } from './event-utils';
import { StatusBadge } from './StatusBadge';

export const ParticipantsSection = ({
  event,
  participants,
}: {
  event: Event;
  participants: Participant[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { status } = useSession();
  const router = useRouter();
  const isAuthed = status === 'authenticated';

  const maskName = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length > 1) {
      parts[parts.length - 1] = '*';
      return parts.join(' ');
    }
    return '*';
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.org.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              หัวข้อกิจกรรม <span className="text-emerald-600">(เปิดลงทะเบียน)</span>
            </h3>
            <p className="text-base font-semibold text-gray-900">{event.title}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {formatThaiDate(event.beginDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {event.time}
              </span>
            </div>
          </div>
          <div className="text-right px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <span className="block text-xs text-blue-600 font-semibold uppercase tracking-wide">ยอดลงทะเบียน</span>
            <span className="text-2xl font-bold text-blue-800">{event.registered} คน</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ หน่วยงาน..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              type="button"
              onClick={() => router.push(`/register?eventId=${event.id}`)}
            >
              <UserPlus size={16} /> ลงทะเบียน
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 cursor-pointer" type="button">
              Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4">หน่วยงาน / ตำแหน่ง</th>
                <th className="px-6 py-4">ข้อมูลติดต่อ</th>
                <th className="px-6 py-4">วันที่ลงทะเบียน</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {isAuthed ? participant.name : maskName(participant.name)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{participant.org}</div>
                      <div className="text-xs text-gray-500">{participant.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      {isAuthed ? (
                        <div className="flex flex-col text-sm text-gray-600">
                          <span>{participant.email}</span>
                          <span className="text-gray-400 text-xs">{participant.phone}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col text-sm text-gray-600">
                          <span>*</span>
                          <span className="text-gray-400 text-xs">*</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{participant.regDate}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={participant.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-blue-600 p-1 cursor-pointer" type="button">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <p>ไม่พบข้อมูลผู้ลงทะเบียน</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">
            แสดง {filteredParticipants.length} รายการ จากทั้งหมด {participants.length} รายการ
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded bg-white text-gray-400 text-sm disabled:opacity-50 cursor-pointer" disabled type="button">
              ก่อนหน้า
            </button>
            <button className="px-3 py-1 border rounded bg-white text-gray-600 text-sm hover:bg-gray-50 cursor-pointer" type="button">
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
