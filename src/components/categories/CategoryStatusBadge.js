import { cn } from '@/lib/shared/utils';
import { CATEGORY_STATUS_CONFIG } from '@/lib/categories/categoryDisplay';
import { getCategoryLifecycleStatus } from '@/lib/categories/categorySchema';

const STATUS_TEXT = {
  active: 'text-green-800',
  inactive: 'text-amber-800',
};

/**
 * @param {{
 *   category: object,
 *   className?: string,
 *   plain?: boolean,
 *   showDot?: boolean,
 * }} props
 */
export default function CategoryStatusBadge({
  category,
  className,
  plain = false,
  showDot = true,
}) {
  const key = getCategoryLifecycleStatus(category);
  const cfg = CATEGORY_STATUS_CONFIG[key] ?? CATEGORY_STATUS_CONFIG.inactive;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold whitespace-nowrap',
        plain
          ? cn('text-xs', STATUS_TEXT[key] ?? STATUS_TEXT.inactive)
          : cn('rounded-full px-2 py-0.5 text-xs ring-1', cfg.className),
        className,
      )}
    >
      {showDot && plain && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', cfg.dot)} aria-hidden />
      )}
      {cfg.label}
    </span>
  );
}
