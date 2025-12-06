'use client';

import { FormEvent, useState } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import type { Event } from '../_data/database';
import { LocationMapModal } from './location-map-modal';
import { DatePickerModal } from './date-picker-modal';
import { getJWTToken } from '@/lib/auth';

export type EventFormMode = 'create' | 'edit';

interface EventFormProps {
  mode: EventFormMode;
  eventId?: number;
  initialEvent?: Event;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
}

export const EventForm = ({
  mode,
  eventId,
  initialEvent,
  onSuccess,
  onCancel,
}: EventFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [locationValue, setLocationValue] = useState(initialEvent?.location ?? '');
  const [selectedLatLng, setSelectedLatLng] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialEvent?.latitude != null && initialEvent.longitude != null
      ? { lat: initialEvent.latitude, lng: initialEvent.longitude }
      : null,
  );
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const [enableCheckInRadius, setEnableCheckInRadius] = useState(
    Boolean(initialEvent?.enableCheckInRadius),
  );
  const [checkInRadius, setCheckInRadius] = useState<number | null>(
    initialEvent?.checkInRadiusMeters ?? 100,
  );

  const [startDate, setStartDate] = useState(initialEvent?.beginDate ?? '');
  const [endDate, setEndDate] = useState(initialEvent?.endDate ?? '');
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);
  const [registerMethod, setRegisterMethod] = useState<number>(initialEvent?.registerMethod ?? 3);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === 'edit' && (eventId == null || Number.isNaN(eventId))) {
      setError('ไม่พบรหัสกิจกรรมสำหรับการแก้ไข');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();
    const beginDate = startDate.trim();
    const endDateRaw = endDate.trim();
    const time = String(formData.get('time') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const capacityRaw = String(formData.get('capacity') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const docLinkRaw = String(formData.get('docLink') ?? '').trim();
    const requiredItemsRaw = String(formData.get('requiredItems') ?? '').trim();

    const capacity = Number(capacityRaw);

    const effectiveCheckInRadius =
      enableCheckInRadius && checkInRadius != null && !Number.isNaN(checkInRadius)
        ? checkInRadius
        : null;

    if (
      !title ||
      !beginDate ||
      !time ||
      !location ||
      !capacityRaw ||
      Number.isNaN(capacity) ||
      !description
    ) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน และตรวจสอบจำนวนผู้เข้าร่วม');
      return;
    }

    setSubmitting(true);

    try {
      // Get JWT token
      const token = await getJWTToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const payload = {
        title,
        beginDate,
        endDate: endDateRaw || null,
        time,
        location,
        capacity,
        description,
        latitude: selectedLatLng?.lat ?? null,
        longitude: selectedLatLng?.lng ?? null,
        enableCheckInRadius,
        checkInRadiusMeters: effectiveCheckInRadius,
        docLink: docLinkRaw || null,
        requiredItems: requiredItemsRaw || null,
        registerMethod,
      };

      const isEdit = mode === 'edit' && eventId != null;
      const url = isEdit ? `/api/events/${eventId}` : '/api/events';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(isEdit ? 'Failed to update event' : 'Failed to create event');
      }

      const data = await res.json();
      const savedEvent = data.event as Event;
      onSuccess?.(savedEvent);
    } catch (e) {
      console.error(e);
      setError(
        mode === 'edit'
          ? 'ไม่สามารถแก้ไขกิจกรรมได้ กรุณาลองใหม่อีกครั้ง'
          : 'ไม่สามารถสร้างกิจกรรมได้ กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
            defaultValue={initialEvent?.title}
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
                name="beginDate"
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
              defaultValue={initialEvent?.time}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="เช่น 09:00 - 16:30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              สถานที่จัดกิจกรรม <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                name="location"
                required
                type="text"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="ระบุสถานที่จัดกิจกรรม"
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
            defaultValue={initialEvent?.capacity}
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
            defaultValue={initialEvent?.description}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="อธิบายรายละเอียดสั้น ๆ เกี่ยวกับกิจกรรม"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            วิธีการลงทะเบียนที่อนุญาต <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2 mt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="registerMethod"
                value={3}
                checked={registerMethod === 3}
                onChange={() => setRegisterMethod(3)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">ทั้งสองแบบ (Provider ID และแบบฟอร์ม)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="registerMethod"
                value={1}
                checked={registerMethod === 1}
                onChange={() => setRegisterMethod(1)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">เฉพาะ Provider ID</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="registerMethod"
                value={2}
                checked={registerMethod === 2}
                onChange={() => setRegisterMethod(2)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">เฉพาะแบบฟอร์ม</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            สิ่งของ/อุปกรณ์ที่ต้องเตรียมมาเอง
          </label>
          <textarea
            name="requiredItems"
            rows={3}
            defaultValue={initialEvent?.requiredItems ?? undefined}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="เช่น คอมพิวเตอร์โน๊ตบุค"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            ลิงก์เอกสารประกอบ (ถ้ามี)
          </label>
          <input
            name="docLink"
            type="url"
            defaultValue={initialEvent?.docLink ?? undefined}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="เช่น https://example.com/document.pdf"
          />
        </div>

        <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100 mt-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm"
            >
              {mode === 'edit' ? 'ยกเลิกกิจกรรม' : 'ยกเลิก'}
            </button>
            {mode === 'edit' && (
              <button
                type="button"
                onClick={() => setDatePickerTarget('start')}
                className="px-5 py-2.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg font-medium transition-colors text-sm"
              >
                เลื่อนกิจกรรม
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg font-medium shadow-sm hover:shadow transition-all text-sm"
          >
            {submitting
              ? 'กำลังบันทึก...'
              : mode === 'edit'
              ? 'บันทึกการแก้ไข'
              : 'บันทึกกิจกรรม'}
          </button>
        </div>
      </form>

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
    </>
  );
};
