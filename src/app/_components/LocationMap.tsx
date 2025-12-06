'use client';

import { useEffect, useRef } from 'react';

interface LocationMapProps {
  eventLatitude: number;
  eventLongitude: number;
  eventTitle?: string;
  userLatitude?: number;
  userLongitude?: number;
  radiusMeters?: number;
  isWithinRadius?: boolean;
}

declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

export default function LocationMap({
  eventLatitude,
  eventLongitude,
  eventTitle,
  userLatitude,
  userLongitude,
  radiusMeters,
  isWithinRadius,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if (window.L) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = window.L;

      // Initialize map
      const map = L.map(mapRef.current).setView([eventLatitude, eventLongitude], 15);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Event location marker (red)
      const eventIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: #ef4444;
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      L.marker([eventLatitude, eventLongitude], { icon: eventIcon })
        .addTo(map)
        .bindPopup(`<strong style="color: #ef4444;">📍 สถานที่จัดงาน</strong>${eventTitle ? `<br/>${eventTitle}` : ''}`);

      // Radius circle
      if (radiusMeters) {
        const circleColor = isWithinRadius ? '#22c55e' : '#ef4444';
        L.circle([eventLatitude, eventLongitude], {
          radius: radiusMeters,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(map);
      }

      // User location marker (person icon)
      if (userLatitude !== undefined && userLongitude !== undefined) {
        const userIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: #3b82f6;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          ">🧑</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18],
        });

        L.marker([userLatitude, userLongitude], { icon: userIcon })
          .addTo(map)
          .bindPopup('<strong style="color: #3b82f6;">🧑 ตำแหน่งของคุณ</strong>');

        // Fit bounds to show both markers
        const bounds = L.latLngBounds(
          [eventLatitude, eventLongitude],
          [userLatitude, userLongitude]
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [eventLatitude, eventLongitude, eventTitle, userLatitude, userLongitude, radiusMeters, isWithinRadius]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[250px] rounded-lg overflow-hidden border border-gray-300 shadow-sm"
    />
  );
}
