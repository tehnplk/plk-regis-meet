'use client';

// TEAM_001: Simple create-event page (placeholder UI for future implementation).

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar } from 'lucide-react';
import { Header } from '../_components/event-ui';
import { LocationMapModal } from '../_components/location-map-modal';
import { DatePickerModal } from '../_components/date-picker-modal';

export default function CreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [locationValue, setLocationValue] = useState('');
  const [selectedLatLng, setSelectedLatLng] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const [enableCheckInRadius, setEnableCheckInRadius] = useState(false);
  const [checkInRadius, setCheckInRadius] = useState<number | null>(300);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();
    const date = startDate.trim();
    const endDateRaw = endDate.trim();
    const time = String(formData.get('time') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const capacityRaw = String(formData.get('capacity') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    const capacity = Number(capacityRaw);

    const effectiveCheckInRadius =
      enableCheckInRadius && checkInRadius != null && !Number.isNaN(checkInRadius)
        ? checkInRadius
        : null;

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
          latitude: selectedLatLng?.lat ?? null,
          longitude: selectedLatLng?.lng ?? null,
          enableCheckInRadius,
          checkInRadiusMeters: effectiveCheckInRadius,
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
                <div className="flex gap-2">
                  <input
                    name="date"
                    required
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="เช่น 2025-01-15 หรือ 15 มกราคม 2568"
                  />
                  <button
                    type="button"
                    onClick={() => setDatePickerTarget('start')}
                    className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                    title="เลือกวันที่เริ่มจากปฏิทิน"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  วันที่สิ้นสุด
                </label>
                <div className="flex gap-2">
                  <input
                    name="endDate"
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="กรณีจัดหลายวัน"
                  />
                  <button
                    type="button"
                    onClick={() => setDatePickerTarget('end')}
                    className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                    title="เลือกวันที่สิ้นสุดจากปฏิทิน"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
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
                <div className="flex gap-2">
                  <input
                    name="location"
                    required
                    type="text"
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="ระบุสถานที่จัดงาน"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                    title="เลือกพิกัดบนแผนที่"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
                {selectedLatLng && (
                  <p className="mt-1 text-xs text-blue-600 inline-flex items-center gap-1">
                    <a
                      href={`https://www.google.com/maps?q=${selectedLatLng.lat},${selectedLatLng.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center"
                    >
                      <MapPin className="w-3 h-3" />
                    </a>
                    <span>
                      ({selectedLatLng.lat.toFixed(5)}, {selectedLatLng.lng.toFixed(5)})
                    </span>
                  </p>
                )}
                <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    name="enableCheckInRadius"
                    checked={enableCheckInRadius}
                    onChange={(e) => setEnableCheckInRadius(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>กำหนดให้เช็คอินได้ในรัศมี</span>
                  <input
                    name="checkInRadius"
                    type="number"
                    min={1}
                    value={checkInRadius ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCheckInRadius(value ? Number(value) : null);
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                  <span>เมตร</span>
                </label>
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

      <LocationMapModal
        open={isMapOpen}
        selectedLatLng={selectedLatLng}
        zoom={mapZoom}
        enableCheckInRadius={enableCheckInRadius}
        checkInRadiusMeters={
          enableCheckInRadius && checkInRadius != null && !Number.isNaN(checkInRadius)
            ? checkInRadius
            : null
        }
        onChangeLatLng={setSelectedLatLng}
        onChangeZoom={setMapZoom}
        onClose={() => setIsMapOpen(false)}
      />

      <DatePickerModal
        open={datePickerTarget !== null}
        value={
          datePickerTarget === 'start'
            ? startDate || null
            : datePickerTarget === 'end'
            ? endDate || null
            : null
        }
        label={
          datePickerTarget === 'start'
            ? 'เลือกวันที่เริ่ม'
            : datePickerTarget === 'end'
            ? 'เลือกวันที่สิ้นสุด'
            : undefined
        }
        onChange={(iso) => {
          if (datePickerTarget === 'start') {
            setStartDate(iso);
          } else if (datePickerTarget === 'end') {
            setEndDate(iso);
          }
        }}
        onClose={() => setDatePickerTarget(null)}
      />
    </div>
  );
}
