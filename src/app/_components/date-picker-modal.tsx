"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerModalProps {
  open: boolean;
  value: string | null; // expected format: YYYY-MM-DD or free text
  label?: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function parseDateString(value: string | null): Date | null {
  if (!value) return null;
  // try ISO first
  const iso = new Date(value);
  if (!Number.isNaN(iso.getTime())) return iso;
  return null;
}

function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePickerModal({
  open,
  value,
  label,
  onChange,
  onClose,
}: DatePickerModalProps) {
  const initialDate = parseDateString(value) ?? new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);

  useEffect(() => {
    if (!open) return;
    const d = parseDateString(value) ?? new Date();
    setCurrentMonth(d);
    setSelectedDate(d);
  }, [open, value]);

  if (!open) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay(); // 0-6, 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i += 1) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    days.push(d);
  }

  const handleSelectDay = (day: number | null) => {
    if (!day) return;
    const selected = new Date(year, month, day);
    setSelectedDate(selected);
  };

  const goPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const today = new Date();
  const todayISO = formatISODate(today);
  const selectedISO = selectedDate ? formatISODate(selectedDate) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden flex flex-col text-xs">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm">
              {label ?? "เลือกวันที่"}
            </span>
            <span className="text-[11px] text-gray-500">
              {THAI_MONTHS[month]} {year + 543}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrevMonth}
              className="p-1 rounded hover:bg-gray-100 text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              className="p-1 rounded hover:bg-gray-100 text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-4 pt-3 pb-3 grid grid-cols-7 gap-1.5 text-center">
          {THAI_WEEKDAYS.map((d) => (
            <div key={d} className="text-[10px] font-medium text-gray-500">
              {d}
            </div>
          ))}
          {days.map((d, idx) => {
            if (!d) {
              return <div key={idx} />;
            }
            const dateObj = new Date(year, month, d);
            const iso = formatISODate(dateObj);
            const isToday = iso === todayISO;
            const isSelected = selectedISO === iso;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDay(d)}
                className={[
                  "h-8 w-8 flex items-center justify-center rounded-full text-[11px]",
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isToday
                    ? "border border-blue-400 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const iso = formatISODate(today);
                onChange(iso);
                onClose();
              }}
              className="px-3 py-1.5 rounded border border-blue-500 bg-white text-blue-600 hover:bg-blue-50"
            >
              วันนี้
            </button>
            <button
              type="button"
              disabled={!selectedDate}
              onClick={() => {
                if (!selectedDate) return;
                const iso = formatISODate(selectedDate);
                onChange(iso);
                onClose();
              }}
              className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
