import { cn } from '@/lib/shared/utils';
import { getProductStatusBadgeTheme } from '@/lib/products/productLifecycleUi';

/**
 * @param {{
 *   status: 'published' | 'draft',
 *   className?: string,
 *   showDot?: boolean,
 *   plain?: boolean,
 * }} props
 */
export default function ProductStatusBadge({
  status = 'draft',
  className,
  showDot = true,
  plain = false,
}) {
  const config = getProductStatusBadgeTheme(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-semibold md:text-xs',
        plain
          ? cn(
            status === 'published' ? 'text-green-800' : 'text-amber-800',
          )
          : cn('rounded-full px-2.5 py-0.5 ring-1', config.className),
        className,
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} aria-hidden />
      )}
      <span className="min-w-0 truncate">{config.label}</span>
    </span>
  );
}
