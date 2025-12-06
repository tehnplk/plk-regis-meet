'use client';

import type { EventStatus } from '../_data/database';
import { STATUS_LABELS } from '../_data/database';
import { STATUS_STYLES } from './event-utils';

export const StatusBadge = ({ status }: { status: EventStatus | 'confirmed' | 'pending' | 'cancelled' }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      STATUS_STYLES[status] ?? STATUS_STYLES.closed
    }`}
  >
    {STATUS_LABELS[status] ?? status}
  </span>
);
