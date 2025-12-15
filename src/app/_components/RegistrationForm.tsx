'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { CheckCircle, UserPlus } from 'lucide-react';
import { getJWTToken } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

// Calculate distance between two coordinates using Haversine formula
function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const RegistrationForm = ({
  eventId,
  eventTitle,
  onSubmitted,
  initialProfile,
  regisClosed,
  enableCheckInRadius,
  checkInRadiusMeters,
  eventLatitude,
  eventLongitude,
  inputTextClassName,
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
  regisClosed?: boolean;
  enableCheckInRadius?: boolean;
  checkInRadiusMeters?: number | null;
  eventLatitude?: number | null;
  eventLongitude?: number | null;
  inputTextClassName?: string;
}) => {
  const { data: session } = useSession();

  const providerIdFromSession = useMemo(() => {
    const raw = (session?.user as any)?.profile as string | undefined;
    if (!raw) return undefined;
    try {
      const profile = JSON.parse(raw) as any;
      return (
        profile?.provider_id ??
        profile?.providerId ??
        undefined
      );
    } catch {
      return undefined;
    }
  }, [session]);
  const defaultName = [initialProfile?.titleTh ?? '', initialProfile?.name ?? '']
    .join('')
    .trim();
  const [phoneInput, setPhoneInput] = useState(initialProfile?.phone ?? '');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(true);
  const [distanceFromEvent, setDistanceFromEvent] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);

  const isRegisClosed = Boolean(regisClosed);

  // Check if radius restriction is enabled
  const radiusRestrictionEnabled =
    enableCheckInRadius &&
    checkInRadiusMeters &&
    checkInRadiusMeters > 0 &&
    eventLatitude !== null &&
    eventLatitude !== undefined &&
    eventLongitude !== null &&
    eventLongitude !== undefined;

  // Get user location on mount if radius restriction is enabled
  useEffect(() => {
    if (!radiusRestrictionEnabled) {
      setIsWithinRadius(true);
      return;
    }

    setLoadingLocation(true);

    if (!navigator.geolocation) {
      setLocationError('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง');
      setIsWithinRadius(false);
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });

        const distance = getDistanceMeters(
          userLat,
          userLng,
          eventLatitude!,
          eventLongitude!
        );
        setDistanceFromEvent(Math.round(distance));

        if (distance <= checkInRadiusMeters!) {
          setIsWithinRadius(true);
          setLocationError(null);
        } else {
          setIsWithinRadius(false);
          setLocationError(
            `คุณอยู่นอกรัศมีที่กำหนด (${Math.round(distance)} เมตร จากสถานที่จัด, รัศมีที่อนุญาต: ${checkInRadiusMeters} เมตร)`
          );
        }
        setLoadingLocation(false);
      },
      (error) => {
        let msg = 'ไม่สามารถระบุตำแหน่งได้';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อลงทะเบียน';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'ไม่สามารถระบุตำแหน่งได้ในขณะนี้';
        } else if (error.code === error.TIMEOUT) {
          msg = 'หมดเวลาในการระบุตำแหน่ง';
        }
        setLocationError(msg);
        setIsWithinRadius(false);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [radiusRestrictionEnabled, eventLatitude, eventLongitude, checkInRadiusMeters]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isRegisClosed) {
      await Swal.fire({
        icon: 'warning',
        title: 'ปิดรับลงทะเบียนแล้ว',
      });
      return;
    }

    if (!eventId) {
      await Swal.fire({
        icon: 'error',
        title: 'ไม่พบรหัสงานสำหรับการลงทะเบียน',
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const org = String(formData.get('org') ?? '').trim();
    const position = String(formData.get('position') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phoneRaw = String(formData.get('phone') ?? '').trim();
    const foodType = (formData.get('foodType') ?? '').toString() as 'normal' | 'islam' | '';
    const providerId = String(formData.get('providerId') ?? '').trim();

    const phone = phoneRaw.replace(/\D/g, '');

    if (!name || !org || !phoneRaw) {
      await Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
      });
      return;
    }

    if (!/^0\d{9}$/.test(phone)) {
      setPhoneError('กรุณากรอกเบอร์ติดต่อ 10 หลัก ตามรูปแบบประเทศไทย เช่น 08 1234 5678');
      return;
    }

    if (!foodType) {
      await Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกประเภทอาหาร',
      });
      return;
    }

    try {
      const token = await getJWTToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          org,
          position,
          email,
          phone,
          providerId: providerId || undefined,
          foodType,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`Failed to register: ${res.status} ${errorText}`);
      }

      const successText =
        eventTitle && eventTitle.trim()
          ? `ลงทะเบียนสำเร็จสำหรับงาน: ${eventTitle}`
          : 'ลงทะเบียนสำเร็จ';
      toast.success(successText);
      setTimeout(() => onSubmitted?.(), 1200);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง';
      await Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถลงทะเบียนได้',
        text: message,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-5 max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      <input type="hidden" name="providerId" value={providerIdFromSession ?? ''} />

      {isRegisClosed && (
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-start gap-2 text-sm text-rose-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>กิจกรรมนี้ปิดรับลงทะเบียนแล้ว</span>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          ชื่อ-นามสกุล <span className="text-red-500">*</span>
        </label>
        <input
          required
          name="name"
          type="text"
          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm ${inputTextClassName ?? ''}`}
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
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm ${inputTextClassName ?? ''}`}
            placeholder="ส่วนราชการ/องค์กร"
            defaultValue={initialProfile?.org}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ตำแหน่ง</label>
          <input
            name="position"
            type="text"
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm ${inputTextClassName ?? ''}`}
            placeholder="ระบุตำแหน่ง"
            defaultValue={initialProfile?.position}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            เบอร์ติดต่อ <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="phone"
            type="tel"
            maxLength={12}
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm ${inputTextClassName ?? ''}`}
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
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            อีเมล
          </label>
          <input
            name="email"
            type="email"
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm ${inputTextClassName ?? ''}`}
            placeholder="name@example.com"
            defaultValue={initialProfile?.email}
          />
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

      {/* Location warning for radius restriction */}
      {radiusRestrictionEnabled && (
        <div className="space-y-2">
          {loadingLocation && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
              <MapPin size={16} className="animate-pulse" />
              <span>กำลังตรวจสอบตำแหน่งของคุณ...</span>
            </div>
          )}
          {!loadingLocation && isWithinRadius && userLocation && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-2 text-sm text-green-800">
              <MapPin size={16} />
              <span>คุณอยู่ในรัศมีที่กำหนด ({distanceFromEvent} เมตร จากสถานที่จัด)</span>
            </div>
          )}
          {!loadingLocation && !isWithinRadius && locationError && (
            <div className="bg-red-50 border border-red-300 p-3 rounded-lg flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>
      )}

      <div className="pt-2 flex gap-3 justify-end border-t border-gray-100 mt-6">
        <button
          type="submit"
          disabled={isRegisClosed || !!(radiusRestrictionEnabled && (!isWithinRadius || loadingLocation))}
          className={`px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 text-sm ${
            isRegisClosed || (radiusRestrictionEnabled && (!isWithinRadius || loadingLocation))
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'text-white bg-blue-600 hover:bg-blue-700 hover:shadow cursor-pointer'
          }`}
        >
          <UserPlus size={18} />
          ยืนยันการลงทะเบียน
        </button>
      </div>
    </form>
  );
};
