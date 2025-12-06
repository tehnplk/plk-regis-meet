import type { EventStatus } from '../_data/database';

export const STATUS_STYLES: Record<EventStatus | 'confirmed' | 'pending' | 'cancelled', string> = {
  scheduled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  open: 'bg-green-100 text-green-700 border-green-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  full: 'bg-orange-100 text-orange-700 border-orange-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  postponed: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const TH_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export function formatThaiDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(trimmed);
  if (!isoMatch) {
    return trimmed;
  }

  const year = Number(isoMatch[1]);
  const month = Number(isoMatch[2]);
  const day = Number(isoMatch[3]);

  if (!year || !month || !day || month < 1 || month > 12) {
    return trimmed;
  }

  const buddhistYear = year + 543;
  const monthName = TH_MONTHS_SHORT[month - 1];
  const dayStr = String(day).padStart(2, '0');
  const yearShort = String(buddhistYear).slice(-2);

  return `${dayStr} ${monthName} ${yearShort}`;
}

export function getDaysUntil(dateStr: string): number | null {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;

  const start = new Date(parsed);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = start.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
