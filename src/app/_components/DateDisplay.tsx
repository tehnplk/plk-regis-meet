'use client';

import { Calendar } from 'lucide-react';
import { formatThaiDate } from './event-utils';

export const DateDisplay = ({
  startDate,
  endDate,
  iconSize = 16,
}: {
  startDate: string;
  endDate: string | null;
  iconSize?: number;
}) => {
  const formattedStart = formatThaiDate(startDate);
  const formattedEnd = endDate ? formatThaiDate(endDate) : null;

  return (
    <div className="flex items-center gap-2">
      <Calendar size={iconSize} className="text-emerald-500 shrink-0" />
      <span>
        {formattedStart}
        {formattedEnd && formattedEnd !== formattedStart ? ` - ${formattedEnd}` : ''}
      </span>
    </div>
  );
};
