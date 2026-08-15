import { cn } from '@/lib/shared/utils';
import { PRODUCT_CARD_DISCOUNT_PCT_CLASS } from '@/lib/products/variationDisplay';

/** Màu badge trên ProductCard / preview cửa hàng — đồng bộ greenmate_fe ProductBadge.js */
const STOREFRONT_BADGE_BG = {
  hot: 'bg-brand-primary',
  new: 'bg-blue-700',
  sale: 'bg-amber-500',
};

/**
 * @deprecated Dùng getStorefrontProductBadgeBgClass từ StorefrontProductBadge.js
 */
export function getStorefrontProductBadgeClass(badgeType) {
  const bg = STOREFRONT_BADGE_BG[badgeType] ?? 'bg-brand-accent';
  return cn(bg, 'text-white');
}

/** Pill % giảm giá — khớp PRODUCT_CARD_DISCOUNT_PCT_CLASS storefront */
export const STOREFRONT_DISCOUNT_PILL_CLASS = PRODUCT_CARD_DISCOUNT_PCT_CLASS;
