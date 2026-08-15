import { cn } from '@/lib/shared/utils';
import { getVoucherLifecycleStatus } from '@/lib/vouchers/voucherSchema';

const STATUS_CONFIG = {
  active: {
    label: 'Đang chạy',
    dot: 'bg-green-600',
    text: 'text-green-800',
    className: 'bg-green-100 text-green-900 ring-green-300',
  },
  scheduled: {
    label: 'Sắp diễn ra',
    dot: 'bg-blue-500',
    text: 'text-blue-800',
    className: 'bg-blue-50 text-blue-800 ring-blue-200',
  },
  expired: {
    label: 'Hết hạn',
    dot: 'bg-rose-600',
    text: 'text-rose-800',
    className: 'bg-rose-100 text-rose-900 ring-rose-300',
  },
  inactive: {
    label: 'Đã tắt',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
};

/**
 * @param {{
 *   discount: object,
 *   className?: string,
 *   showDot?: boolean,
 *   dense?: boolean,
 *   plain?: boolean,
 * }} props
 */
export default function VoucherStatusBadge({
  discount,
  className,
  showDot = true,
  dense = false,
  plain = false,
}) {
  const status = getVoucherLifecycleStatus(discount);
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold',
        plain
          ? cn('text-[10px] md:text-xs', config.text)
          : cn(
            'rounded-full px-2.5 py-0.5 ring-1',
            dense ? 'text-[13px]' : 'text-[10px] md:text-xs',
            config.className,
          ),
        className,
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} aria-hidden />
      )}
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
