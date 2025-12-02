'use client';

// TEAM_001: Simple create-event page (placeholder UI for future implementation).

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../_components/event-ui';

export default function CreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();
    const date = String(formData.get('date') ?? '').trim();
    const endDateRaw = String(formData.get('endDate') ?? '').trim();
    const time = String(formData.get('time') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const capacityRaw = String(formData.get('capacity') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    const capacity = Number(capacityRaw);

    if (
      !title ||
      !date ||
      !time ||
      !location ||
      !capacityRaw ||
      Number.isNaN(capacity) ||
      !description
    ) {
      setError(
        'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน และตรวจสอบจำนวนผู้เข้าร่วม',
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          date,
          endDate: endDateRaw || null,
          time,
          location,
          capacity,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create event');
      }

      window.alert('สร้างกิจกรรมสำเร็จ');
      router.push('/');
    } catch (e) {
      console.error(e);
      setError('ไม่สามารถสร้างกิจกรรมได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">สร้างกิจกรรมใหม่</h2>
        <p className="text-gray-600 text-sm">
          หน้านี้สำหรับสร้างกิจกรรมใหม่ และจัดเก็บข้อมูลลงฐานข้อมูล.
        </p>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ชื่อกิจกรรม <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                required
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="ระบุชื่อกิจกรรม"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  วันที่เริ่ม <span className="text-red-500">*</span>
                </label>
                <input
                  name="date"
                  required
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="เช่น 15 มกราคม 2568"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  วันที่สิ้นสุด
                </label>
                <input
                  name="endDate"
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="กรณีจัดหลายวัน"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  เวลา <span className="text-red-500">*</span>
                </label>
                <input
                  name="time"
                  required
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="เช่น 09:00 - 16:30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  สถานที่จัดงาน <span className="text-red-500">*</span>
                </label>
                <input
                  name="location"
                  required
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="ระบุสถานที่จัดงาน"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                จำนวนผู้เข้าร่วมสูงสุด <span className="text-red-500">*</span>
              </label>
              <input
                name="capacity"
                required
                type="number"
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="เช่น 100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                รายละเอียดกิจกรรม <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="อธิบายรายละเอียดสั้น ๆ เกี่ยวกับกิจกรรม"
              />
            </div>

            <div className="pt-2 flex gap-3 justify-end border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg font-medium shadow-sm hover:shadow transition-all text-sm"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
