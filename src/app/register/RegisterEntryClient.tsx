'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertTriangle, MapPin } from 'lucide-react';
import LocationMap from '../_components/LocationMap';

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

interface RegisterEntryClientProps {
  eventId?: string;
  eventTitle?: string | null;
  allowProviderId: boolean;
  allowForm: boolean;
  byFormHref: string;
  providerIdAction: (formData: FormData) => Promise<void>;
  enableCheckInRadius?: boolean;
  checkInRadiusMeters?: number | null;
  eventLatitude?: number | null;
  eventLongitude?: number | null;
}

export default function RegisterEntryClient({
  eventId,
  eventTitle,
  allowProviderId,
  allowForm,
  byFormHref,
  providerIdAction,
  enableCheckInRadius,
  checkInRadiusMeters,
  eventLatitude,
  eventLongitude,
}: RegisterEntryClientProps) {
  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(true);
  const [distanceFromEvent, setDistanceFromEvent] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);

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
        timeout: 30000,
        maximumAge: 0,
      }
    );
  }, [radiusRestrictionEnabled, eventLatitude, eventLongitude, checkInRadiusMeters]);

  const isDisabled = !!(radiusRestrictionEnabled && (!isWithinRadius || loadingLocation));

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      {eventId && (
        <div className="rounded-xl border-2 border-emerald-500 px-4 py-3 shadow-sm">
          <p className="text-lg font-semibold text-emerald-900">เลือกวิธีลงทะเบียนสำหรับ</p>
          <p className="text-2xl font-black text-emerald-950">
            eventId: {eventId}{' '}
            {eventTitle ? (
              <span className="ml-2 text-xl font-semibold text-emerald-800">({eventTitle})</span>
            ) : (
              ''
            )}
          </p>
        </div>
      )}

      {/* Location warning for radius restriction */}
      {radiusRestrictionEnabled && (
        <div className="space-y-3">
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

          {/* Map showing event location and user location */}
          <LocationMap
            eventLatitude={eventLatitude!}
            eventLongitude={eventLongitude!}
            eventTitle={eventTitle ?? undefined}
            userLatitude={userLocation?.lat}
            userLongitude={userLocation?.lng}
            radiusMeters={checkInRadiusMeters ?? undefined}
            isWithinRadius={isWithinRadius}
          />
          <p className="text-xs text-gray-500 text-center">
            � หมุดแดง = สถานที่จัดงาน | 🧑 รูปคน = ตำแหน่งของคุณ | วงกลม = รัศมีที่อนุญาต ({checkInRadiusMeters} เมตร)
          </p>
        </div>
      )}

      <div className={`grid gap-4 ${allowProviderId && allowForm ? 'sm:grid-cols-2' : 'sm:grid-cols-1 max-w-md mx-auto'}`}>
        {allowProviderId && (
          <form
            action={providerIdAction}
            className={`w-full rounded-lg border px-4 py-6 text-left shadow-sm ${
              isDisabled
                ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                : 'border-emerald-300 bg-emerald-100 hover:border-emerald-400 hover:shadow-md cursor-pointer'
            }`}
          >
            <input type="hidden" name="landing" value={byFormHref} />
            <input type="hidden" name="is_auth" value="no" />
            <button
              type="submit"
              disabled={isDisabled}
              className={`block w-full text-left ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/images/provider_id.png"
                  alt="Provider ID"
                  width={64}
                  height={64}
                  className={`h-14 w-14 rounded-md border bg-white object-contain p-1 shadow-sm ${
                    isDisabled ? 'border-gray-200 grayscale' : 'border-emerald-200'
                  }`}
                />
                <div>
                  <div className={`text-lg font-semibold ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                    ลงทะเบียนด้วย Provider ID
                  </div>
                  <p className={`mt-1 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                    ใช้บัญชีผู้ให้บริการของ MOPH Platform
                  </p>
                </div>
              </div>
            </button>
          </form>
        )}

        {allowForm && (
          <a
            href={isDisabled ? undefined : byFormHref}
            onClick={(e) => isDisabled && e.preventDefault()}
            className={`w-full rounded-lg border px-4 py-6 text-left shadow-sm ${
              isDisabled
                ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                : 'border-blue-300 bg-blue-100 hover:border-blue-400 hover:shadow-md cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/google-forms.png"
                alt="แบบฟอร์ม"
                width={64}
                height={64}
                className={`h-14 w-14 rounded-md border bg-white object-contain p-1 shadow-sm ${
                  isDisabled ? 'border-gray-200 grayscale' : 'border-blue-200'
                }`}
              />
              <div>
                <div className={`text-lg font-semibold ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  ลงทะเบียนด้วยแบบฟอร์ม
                </div>
                <p className={`mt-1 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  กรอกข้อมูลเข้าร่วมกิจกรรมด้วยตนเอง
                </p>
              </div>
            </div>
          </a>
        )}
      </div>
    </main>
  );
}
