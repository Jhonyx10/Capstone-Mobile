// src/util/operationHelpers.ts
import type { OperationStatus } from '../src/types/OperationType';

export const formatEventDate = (d?: string | null) => {
  if (!d) return null;
  const date = new Date(`${d.slice(0, 10)}T00:00:00`);
  return isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
};

// "Today", "Tomorrow", "In 12 days", "In 6 months"; null if no date or already past
export const countdownLabel = (d?: string | null) => {
  if (!d) return null;
  const target = new Date(`${d.slice(0, 10)}T00:00:00`);
  if (isNaN(target.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (days < 0) return null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 60) return `In ${days} days`;
  return `In ${Math.round(days / 30)} months`;
};

export const STATUS_STYLES: Record<
  OperationStatus,
  { label: string; pill: string; text: string }
> = {
  upcoming: {
    label: 'Upcoming',
    pill: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
  },
  active: {
    label: 'Active',
    pill: 'bg-lime-100 dark:bg-lime-900/40',
    text: 'text-lime-700 dark:text-lime-400',
  },
  completed: {
    label: 'Completed',
    pill: 'bg-gray-100 dark:bg-slate-700',
    text: 'text-gray-600 dark:text-gray-300',
  },
  suspended: {
    label: 'Suspended',
    pill: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
  },
};