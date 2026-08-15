import { cn } from '@/lib/shared/utils';
import { getVoucherUsage } from '@/lib/vouchers/voucherDisplay';

/**
 * Thanh tiến độ lượt dùng voucher.
 *
 * @param {{ discount: object, compact?: boolean, size?: 'sm' | 'md', className?: string, hideBar?: boolean, denseText?: boolean }} props
 */
export default function VoucherUsageBar({
  discount,
  compact = false,
  size = 'sm',
  className,
  hideBar = false,
  denseText = false,
}) {
  const { used, max, percent, remaining } = getVoucherUsage(discount);
  const isLow = remaining <= Math.max(1, Math.floor(max * 0.1));
  const isExhausted = remaining <= 0;

  const textSizeClass = denseText
    ? 'text-[15px]'
    : size === 'md'
      ? 'text-sm'
      : 'text-xs';

  return (
    <div className={cn('min-w-0', className)}>
      <div className={cn('flex items-center justify-between gap-2', textSizeClass)}>
        <span className="font-semibold text-brand-dark tabular-nums">
          {used}/{max} lượt
        </span>
        {!compact && (
          <span
            className={cn(
              'font-medium tabular-nums',
              isExhausted && 'text-rose-600',
              !isExhausted && isLow && 'text-amber-600',
              !isExhausted && !isLow && 'text-emerald-600',
            )}
          >
            Còn {remaining}
          </span>
        )}
      </div>
      {!hideBar && (
      <div
        className={cn(
          'mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100',
          compact && 'mt-1 h-1',
        )}
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width]',
            percent >= 100 ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-brand-primary',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      )}
    </div>
  );
}
