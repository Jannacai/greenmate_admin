/**
 * Kích thước ảnh banner hero — đồng bộ storefront + CMS.
 * Desktop: 3840×1576 (khớp chính xác khi upload).
 * Mobile: tối thiểu 480×701 — tỉ lệ hero phone (§banner admin).
 */
export const BANNER_DESKTOP_IMAGE = { width: 3840, height: 1576 };
export const BANNER_MOBILE_IMAGE = { width: 480, height: 701 };

export const BANNER_DESKTOP_ASPECT_CLASS = 'aspect-[3840/1576]';
export const BANNER_MOBILE_ASPECT_CLASS = 'aspect-[480/701]';

/**
 * Banner strip danh mục (CategoryHeroBanner) — file gốc upload CMS.
 * Desktop: 3840×1200 · Mobile: 585×624 (cùng tỉ lệ render ~375×400 / strip desktop).
 */
export const CATEGORY_STRIP_DESKTOP_IMAGE = { width: 3840, height: 1200 };
export const CATEGORY_STRIP_MOBILE_IMAGE = { width: 585, height: 624 };
export const CATEGORY_STRIP_DESKTOP_ASPECT_CLASS = 'aspect-[3840/1200]';
export const CATEGORY_STRIP_MOBILE_ASPECT_CLASS = 'aspect-[585/624]';
