'use client';

import { useState, FormEvent } from 'react';
import { CheckCircle, UserPlus } from 'lucide-react';

export const RegistrationForm = ({
  eventId,
  eventTitle,
  onSubmitted,
  initialProfile,
}: {
  eventId?: number;
  eventTitle?: string;
  onSubmitted?: () => void;
  initialProfile?: {
    titleTh?: string;
    name?: string;
    org?: string;
    position?: string;
    email?: string;
    phone?: string;
  };
}) => {
  const defaultName = [initialProfile?.titleTh ?? '', initialProfile?.name ?? '']
    .join('')
    .trim();
  const [phoneInput, setPhoneInput] = useState(initialProfile?.phone ?? '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!eventId) {
      window.alert('ไม่พบรหัสงานสำหรับการลงทะเบียน');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const org = String(formData.get('org') ?? '').trim();
    const position = String(formData.get('position') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phoneRaw = String(formData.get('phone') ?? '').trim();
    const foodType = (formData.get('foodType') ?? '').toString() as 'normal' | 'islam' | '';

    const phone = phoneRaw.replace(/\D/g, '');

    if (!name || !org || !email || !phoneRaw) {
      window.alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (!/^0\d{9}$/.test(phone)) {
      setPhoneError('กรุณากรอกเบอร์ติดต่อ 10 หลัก ตามรูปแบบประเทศไทย เช่น 08 1234 5678');
      return;
    }

    if (!foodType) {
      window.alert('กรุณาเลือกประเภทอาหาร');
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          org,
          position,
          email,
          phone,
          foodType,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to register');
      }

      const successText =
        eventTitle && eventTitle.trim()
          ? `ลงทะเบียนสำเร็จสำหรับงาน: ${eventTitle}`
          : 'ลงทะเบียนสำเร็จ';
      setToastMessage(successText);
      setTimeout(() => setToastMessage(null), 1600);
      setTimeout(() => onSubmitted?.(), 1200);
    } catch (error) {
      console.error(error);
      window.alert('ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-w-lg mx-auto">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          ชื่อ-นามสกุล <span className="text-red-500">*</span>
        </label>
        <input
          required
          name="name"
          type="text"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
          placeholder="เช่น นายสมชาย มีมาก"
          defaultValue={defaultName || undefined}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            หน่วยงาน <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="org"
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="ส่วนราชการ/องค์กร"
            defaultValue={initialProfile?.org}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ตำแหน่ง</label>
          <input
            name="position"
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="ระบุตำแหน่ง"
            defaultValue={initialProfile?.position}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            อีเมล <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="email"
            type="email"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="name@example.com"
            defaultValue={initialProfile?.email}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            เบอร์ติดต่อ <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="phone"
            type="tel"
            maxLength={12}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="เช่น 08 1234 5678"
            value={phoneInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
              let formatted = raw;
              if (raw.length > 2 && raw.length <= 6) {
                formatted = `${raw.slice(0, 2)} ${raw.slice(2)}`;
              } else if (raw.length > 6) {
                formatted = `${raw.slice(0, 2)} ${raw.slice(2, 6)} ${raw.slice(6)}`;
              }
              setPhoneInput(formatted);

              if (phoneError) {
                if (!raw || /^0\d{9}$/.test(raw)) {
                  setPhoneError(null);
                }
              }
            }}
          />
          {phoneError && (
            <p className="mt-1 text-xs text-red-500">{phoneError}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-1.5">
            ประเภทอาหาร <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="foodType"
                value="normal"
                defaultChecked
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span>อาหารปกติ</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="foodType"
                value="islam"
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span>อาหารอิสลาม (ฮาลาล)</span>
            </label>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-700 mt-2 sm:mt-0">
          <CheckCircle size={14} className="mt-0.5 shrink-0" />
          <p>
            กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน
          </p>
        </div>
      </div>

      <div className="pt-2 flex gap-3 justify-end border-t border-gray-100 mt-6">
        <button
          type="submit"
          className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm hover:shadow transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          <UserPlus size={18} />
          ยืนยันการลงทะเบียน
        </button>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toastMessage}
        </div>
      )}
    </form>
  );
};
