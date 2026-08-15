import { cn } from '@/lib/shared/utils';

const STATUS_CONFIG = {
  active: {
    label: 'Hoạt động',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  pending: {
    label: 'Chờ duyệt',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  block: {
    label: 'Đã khóa',
    dot: 'bg-red-500',
    text: 'text-red-700',
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
};

/**
 * @param {{
 *   status?: string,
 *   className?: string,
 *   plain?: boolean,
 *   showDot?: boolean,
 * }} props
 */
export default function CustomerStatusBadge({
  status = 'pending',
  className,
  plain = false,
  showDot = true,
}) {
  const item = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold whitespace-nowrap',
        plain
          ? cn('text-xs', item.text)
          : cn('rounded-full px-2 py-0.5 text-[10px] ring-1', item.className),
        className,
      )}
    >
      {showDot && plain && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.dot)} aria-hidden />
      )}
      {item.label}
    </span>
  );
}
