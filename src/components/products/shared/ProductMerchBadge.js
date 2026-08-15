import { cn } from '@/lib/shared/utils';

/** @type {Record<string, string>} */
const MERCH_BADGE_STYLE = {
  hot: 'bg-rose-50 text-rose-700 ring-rose-200',
  new: 'bg-blue-50 text-blue-800 ring-blue-200',
  sale: 'bg-amber-50 text-amber-800 ring-amber-200',
  custom: 'bg-brand-light text-brand-dark ring-brand-accent/40',
};

/** Màu chữ thuần — dùng trong bảng danh sách (không nền/viền). */
const MERCH_BADGE_TEXT = {
  hot: 'text-rose-700',
  new: 'text-blue-800',
  sale: 'text-amber-800',
  custom: 'text-brand-dark',
};

/**
 * Badge merchandising trên list admin (hot / new / sale / custom).
 *
 * @param {{ badge: { type: string, text: string }, className?: string, plain?: boolean }} props
 */
export default function ProductMerchBadge({ badge, className, plain = false }) {
  if (!badge?.type || badge.type === 'none') return null;

  return (
    <span
      className={cn(
        plain
          ? 'inline-flex items-center justify-center'
          : 'inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 md:text-xs',
        plain
          ? (MERCH_BADGE_TEXT[badge.type] ?? MERCH_BADGE_TEXT.custom)
          : (MERCH_BADGE_STYLE[badge.type] ?? MERCH_BADGE_STYLE.custom),
        className,
      )}
      title={badge.text}
    >
      <span className="min-w-0 truncate">{badge.text}</span>
    </span>
  );
}
