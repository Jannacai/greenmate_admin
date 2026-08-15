import { cn } from '@/lib/shared/utils';

/**
 * Màu badge — đồng bộ greenmate_fe ProductBadge.js
 * @param {string} [badgeType]
 */
export function getStorefrontProductBadgeBgClass(badgeType) {
  const map = {
    hot: 'bg-brand-primary',
    new: 'bg-blue-700',
    sale: 'bg-amber-500',
  };
  return map[badgeType] ?? 'bg-brand-accent';
}

/**
 * Badge góc ảnh ProductCard preview — khớp storefront.
 * @param {{ badge?: { badge_type?: string, text?: string } | null }} props
 */
export default function StorefrontProductBadge({ badge }) {
  if (!badge?.text) return null;

  return (
    <span
      className={cn(
        'absolute top-2 right-2 z-10 select-none shadow-sm',
        'inline-flex items-center justify-center',
        'w-[64px] h-[19px] rounded-full',
        'text-[10px] font-bold uppercase tracking-wide text-white',
        'truncate px-1 min-w-0',
        getStorefrontProductBadgeBgClass(badge.badge_type),
      )}
      title={badge.text}
    >
      {badge.text}
    </span>
  );
}
