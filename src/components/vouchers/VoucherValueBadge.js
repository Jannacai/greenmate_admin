import { cn } from '@/lib/shared/utils';
import { getVoucherValueLabel } from '@/lib/vouchers/voucherDisplay';
/**
 * Badge giá trị giảm — dễ nhận diện trên list/detail.
 *
 * @param {{ discount: object, size?: 'sm' | 'md' | 'lg', className?: string }} props
 */
export default function VoucherValueBadge({ discount, size = 'md', className }) {
  const isPercent = discount?.discount_type === 'percentage';

  const sizeClasses = {
    sm: 'w-[148px] shrink-0 px-2 py-1',
    md: 'w-[168px] shrink-0 px-3 py-2',
    lg: 'min-w-[88px] px-4 py-3',
  };

  const valueClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl',
  };

  const subtitleClasses = {
    sm: 'text-[10px] font-semibold uppercase tracking-wide opacity-90 md:text-[11px]',
    md: 'text-[11px] font-semibold uppercase tracking-wide opacity-90 md:text-xs',
    lg: 'text-xs font-semibold uppercase tracking-wide opacity-90 md:text-sm',
  };

  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center justify-center rounded-xl text-center',
        isPercent
          ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
          : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
        sizeClasses[size],
        className,
      )}
    >
      <span className={subtitleClasses[size]}>Giảm</span>
      <span className={cn('mt-0.5 font-bold leading-none tabular-nums whitespace-nowrap', valueClasses[size])}>
        {getVoucherValueLabel(discount)}
      </span>
    </div>
  );
}
