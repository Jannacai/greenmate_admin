import { cn } from '@/lib/shared/utils';

const TONE_CLASS = {
  green: 'bg-green-50 text-green-700 ring-green-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  gray: 'bg-gray-50 text-gray-600 ring-gray-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  neutral: 'bg-gray-50 text-gray-600 ring-gray-200',
};

/**
 * Pill thống kê nhanh trên trang list admin.
 * @param {{ label: string, value: number | string, tone?: keyof typeof TONE_CLASS, className?: string }} props
 */
export function StatPill({ label, value, tone, className }) {
  const toneClass = tone ? TONE_CLASS[tone] : className;

  return (
    <span className={cn('rounded-full px-3 py-1 text-xs ring-1', toneClass ?? className)}>
      {label} <strong>{value}</strong>
    </span>
  );
}
