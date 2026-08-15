import { cn } from '@/lib/shared/utils';
import { ORDER_STATUS_CONFIG, getOrderStatusKey } from '@/lib/orders/orderDisplay';

const STATUS_DOT = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-rose-500',
};

const STATUS_TEXT = {
  pending: 'text-amber-700',
  confirmed: 'text-blue-700',
  shipped: 'text-purple-700',
  delivered: 'text-emerald-700',
  cancelled: 'text-rose-700',
};

/**
 * @param {{
 *   status?: string,
 *   className?: string,
 *   plain?: boolean,
 *   showDot?: boolean,
 * }} props
 */
export default function OrderStatusBadge({
  status,
  className,
  plain = false,
  showDot = true,
}) {
  const key = status && ORDER_STATUS_CONFIG[status] ? status : getOrderStatusKey({ order_status: status });
  const cfg = ORDER_STATUS_CONFIG[key] ?? ORDER_STATUS_CONFIG.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold whitespace-nowrap',
        plain
          ? cn('text-xs', STATUS_TEXT[key] ?? STATUS_TEXT.pending)
          : cn(
            'rounded-full border px-2.5 py-0.5 text-[11px]',
            cfg.badgeClass,
          ),
        className,
      )}
    >
      {showDot && plain && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT[key] ?? STATUS_DOT.pending)}
          aria-hidden
        />
      )}
      {cfg.label}
    </span>
  );
}
