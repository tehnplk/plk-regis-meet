"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

type LatLng = {
  lat: number;
  lng: number;
};

interface LocationMapModalProps {
  open: boolean;
  selectedLatLng: LatLng | null;
  zoom: number | null;
  enableCheckInRadius: boolean;
  checkInRadiusMeters: number | null;
  onChangeLatLng: (value: LatLng) => void;
  onChangeZoom: (zoom: number) => void;
  onClose: () => void;
}

export function LocationMapModal({
  open,
  selectedLatLng,
  zoom,
  enableCheckInRadius,
  checkInRadiusMeters,
  onChangeLatLng,
  onChangeZoom,
  onClose,
}: LocationMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const streetLayerRef = useRef<any>(null);
  const satelliteLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    let cancelled = false;

    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      if ((window as any).L) {
        initMap();
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Leaflet"));
        document.body.appendChild(script);

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      });

      if (!cancelled) {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
        return;
      }

      const defaultCenter: [number, number] = [16.8203, 100.2629];
      const initialCenter: [number, number] = selectedLatLng
        ? [selectedLatLng.lat, selectedLatLng.lng]
        : defaultCenter;
      const initialZoom = typeof zoom === "number" ? zoom : 8;
      const map = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);
      leafletMapRef.current = map;

      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        },
      );

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
      );

      const baseLayers = {
        ถนน: streetLayer,
        ดาวเทียม: satelliteLayer,
      };

      streetLayer.addTo(map);
      L.control.layers(baseLayers, undefined, { position: 'topright' }).addTo(map);

      streetLayerRef.current = streetLayer;
      satelliteLayerRef.current = satelliteLayer;

      map.on("zoomend", () => {
        if (!leafletMapRef.current) return;
        const currentZoom = leafletMapRef.current.getZoom();
        if (typeof currentZoom === "number") {
          onChangeZoom(currentZoom);
        }
      });

      if (selectedLatLng) {
        const existingLatLng = L.latLng(selectedLatLng.lat, selectedLatLng.lng);
        markerRef.current = L.marker(existingLatLng, { draggable: true }).addTo(
          map,
        );
        markerRef.current.on("dragend", (event: any) => {
          const pos = event.target.getLatLng();
          onChangeLatLng({ lat: pos.lat, lng: pos.lng });
          if (leafletMapRef.current) {
            leafletMapRef.current.panTo(pos);
          }
        });
      }

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        onChangeLatLng({ lat, lng });

        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng, { draggable: true }).addTo(
            map,
          );
          markerRef.current.on("dragend", (event: any) => {
            const pos = event.target.getLatLng();
            onChangeLatLng({ lat: pos.lat, lng: pos.lng });
            if (leafletMapRef.current) {
              leafletMapRef.current.panTo(pos);
            }
          });
        }

        if (leafletMapRef.current) {
          leafletMapRef.current.panTo(e.latlng);
        }
      });
    };

    loadLeaflet();

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markerRef.current = null;
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
      streetLayerRef.current = null;
      satelliteLayerRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!leafletMapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (enableCheckInRadius && checkInRadiusMeters && selectedLatLng) {
      const center = L.latLng(selectedLatLng.lat, selectedLatLng.lng);
      if (circleRef.current) {
        circleRef.current.setLatLng(center);
        circleRef.current.setRadius(checkInRadiusMeters);
      } else {
        circleRef.current = L.circle(center, {
          radius: checkInRadiusMeters,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(leafletMapRef.current);
      }
    } else {
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
    }
  }, [open, enableCheckInRadius, checkInRadiusMeters, selectedLatLng]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            เลือกพิกัดสถานที่จัดงานบนแผนที่
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            ปิด
          </button>
        </div>
        <div className="p-4">
          <div
            ref={mapContainerRef}
            className="w-full h-80 sm:h-[480px] rounded-lg overflow-hidden border border-gray-200"
          />
          <p className="mt-2 text-xs text-gray-500">
            คลิกบนแผนที่เพื่อเลือกพิกัด จากนั้นกด "ใช้พิกัดนี้" ระบบจะเติมพิกัดเข้าไปในช่องสถานที่จัดงาน
          </p>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs">
          <div className="text-gray-600 space-y-1">
            <div>
              {selectedLatLng ? (
                <>
                  <span className="inline-flex items-center gap-1">
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
                  </span>
                  {enableCheckInRadius && checkInRadiusMeters && (
                    <p className="mt-1 text-[10px] text-blue-600">
                      รัศมีเช็คอินในระยะ {checkInRadiusMeters} เมตร
                    </p>
                  )}
                </>
              ) : (
                <span>ยังไม่ได้เลือกพิกัด</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={!selectedLatLng}
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              ใช้พิกัดนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
