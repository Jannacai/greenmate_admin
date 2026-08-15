import { cn } from '@/lib/shared/utils';

/** @typedef {'overlay' | 'swatch'} VariationDisplayMode */

export const VARIATION_DISPLAY_OPTIONS = [
  { value: 'overlay', label: 'Overlay' },
  { value: 'swatch', label: 'Nút dưới ảnh' },
];

/**
 * Mặc định theo thứ tự nhóm (legacy: nhóm 1 = overlay khi có ≥2 nhóm).
 * @param {number} index
 * @param {number} total
 * @returns {VariationDisplayMode}
 */
export function getDefaultVariationDisplayMode(index, total) {
  if (total <= 1) return 'swatch';
  return index === 0 ? 'overlay' : 'swatch';
}

/**
 * @param {VariationDisplayMode | string | undefined} mode
 * @returns {VariationDisplayMode}
 */
export function normalizeDisplayModeValue(mode) {
  return mode === 'overlay' ? 'overlay' : 'swatch';
}

/**
 * Đảm bảo đúng 1 nhóm overlay khi có ≥2 variation.
 * @param {object[]} variations
 */
export function ensureVariationDisplayModes(variations = []) {
  if (!variations?.length) return [];

  const total = variations.length;
  let next = variations.map((v, i) => ({
    ...v,
    display_mode: normalizeDisplayModeValue(
      v.display_mode ?? getDefaultVariationDisplayMode(i, total),
    ),
  }));

  if (total <= 1) {
    return next.map((v) => ({ ...v, display_mode: 'swatch' }));
  }

  const overlayIdx = next.findIndex((v) => v.display_mode === 'overlay');
  if (overlayIdx < 0) {
    next[0] = { ...next[0], display_mode: 'overlay' };
    for (let i = 1; i < next.length; i += 1) {
      next[i] = { ...next[i], display_mode: 'swatch' };
    }
  } else {
    next = next.map((v, i) =>
      i === overlayIdx ? v : { ...v, display_mode: 'swatch' },
    );
  }

  return next;
}

/**
 * Đổi display_mode một nhóm — tự ép nhóm còn lại (chỉ 1 overlay).
 * @param {object[]} variations
 * @param {number} changedIndex
 * @param {string} newMode
 */
export function applyVariationDisplayModeChange(variations, changedIndex, newMode) {
  const mode = normalizeDisplayModeValue(newMode);
  let next = variations.map((v, i) =>
    i === changedIndex ? { ...v, display_mode: mode } : { ...v },
  );

  if (next.length <= 1) {
    return next.map((v) => ({ ...v, display_mode: 'swatch' }));
  }

  if (mode === 'overlay') {
    next = next.map((v, i) =>
      i === changedIndex ? v : { ...v, display_mode: 'swatch' },
    );
  } else {
    const fallbackOverlay = changedIndex === 0 ? 1 : 0;
    next = next.map((v, i) =>
      i === fallbackOverlay ? { ...v, display_mode: 'overlay' } : v,
    );
  }

  return ensureVariationDisplayModes(next);
}

/**
 * Đồng bộ greenmate_fe/src/lib/variationDisplay.js — ProductCard swatch/overlay.
 */
export function findOverlayVariationIndex(variations = []) {
  if (variations.length <= 1) return -1;
  const idx = variations.findIndex((v) => v.display_mode === 'overlay');
  return idx >= 0 ? idx : 0;
}

export function getSwatchVariationRows(variations = [], overlayVarIdx) {
  return variations
    .map((variation, varIdx) => ({ variation, varIdx }))
    .filter((row) => row.varIdx !== overlayVarIdx);
}

/** Class màu swatch — áp dụng trong .storefront-product-card (globals.css) */
const GM_SWATCH_SELECTED_CLASS = 'gm-swatch gm-swatch--selected';
const GM_SWATCH_UNSELECTED_CLASS = 'gm-swatch gm-swatch--unselected';

export const PRODUCT_CARD_VARIATION_TEXT_CLASS =
  'text-[10px] lg:text-xs hover:text-[13px] lg:hover:text-[15px]';

const PRODUCT_CARD_SWATCH_BASE_STATIC_CLASS =
  'inline-flex items-center justify-center flex-shrink-0 box-border rounded-full border ' +
  'font-semibold select-none whitespace-nowrap transition-all duration-150';

function getSwatchSizeClasses(previewMode) {
  if (previewMode === 'mobile') return 'h-[22px] px-2 text-[10px]';
  if (previewMode === 'desktop') return 'h-[28px] px-3.5 text-[12px]';
  return 'h-[22px] lg:h-[28px] px-2 lg:px-3.5';
}

function getSwatchTextClasses(previewMode) {
  if (previewMode) return '';
  return PRODUCT_CARD_VARIATION_TEXT_CLASS;
}

const PRODUCT_CARD_SWATCH_BASE_CLASS =
  'inline-flex items-center justify-center flex-shrink-0 box-border ' +
  'h-[22px] lg:h-[28px] px-2 lg:px-3.5 rounded-full border ' +
  'font-semibold select-none whitespace-nowrap transition-all duration-150 ' +
  PRODUCT_CARD_VARIATION_TEXT_CLASS;

/**
 * @param {boolean} isSelected
 * @param {string} [extra]
 * @param {'mobile' | 'desktop' | undefined} [previewMode]
 */
export function productCardSwatchClass(isSelected, extra = '', previewMode) {
  const base = previewMode
    ? cn(PRODUCT_CARD_SWATCH_BASE_STATIC_CLASS, getSwatchSizeClasses(previewMode), getSwatchTextClasses(previewMode))
    : PRODUCT_CARD_SWATCH_BASE_CLASS;

  return cn(
    base,
    isSelected
      ? GM_SWATCH_SELECTED_CLASS
      : GM_SWATCH_UNSELECTED_CLASS,
    extra,
  );
}

/**
 * @param {'mobile' | 'desktop' | undefined} [previewMode]
 */
export function productCardSwatchMoreClass(previewMode) {
  return cn(
    productCardSwatchClass(false, '', previewMode),
    'gm-swatch--more',
  );
}

/**
 * @param {'mobile' | 'desktop' | undefined} [previewMode]
 */
export function getProductCardSwatchZoneClass(previewMode) {
  if (previewMode === 'mobile') {
    return 'w-full shrink-0 flex flex-col items-start gap-1.5 justify-center mt-1.5 min-h-[22px]';
  }
  if (previewMode === 'desktop') {
    return 'w-full shrink-0 flex flex-col items-start gap-2 justify-center mt-2 min-h-[28px]';
  }
  return PRODUCT_CARD_SWATCH_ZONE_CLASS;
}

/**
 * @param {'mobile' | 'desktop' | undefined} [previewMode]
 */
export function getProductCardSwatchRowClass(previewMode) {
  if (previewMode === 'mobile') {
    return 'scrollbar-none flex w-full items-center justify-start gap-1.5 overflow-x-auto min-h-[22px]';
  }
  if (previewMode === 'desktop') {
    return 'scrollbar-none flex w-full items-center justify-start gap-2 overflow-x-auto min-h-[28px]';
  }
  return PRODUCT_CARD_SWATCH_ROW_CLASS;
}

export const PRODUCT_CARD_SWATCH_ZONE_CLASS =
  'w-full shrink-0 flex flex-col items-start gap-1.5 justify-center ' +
  'mt-1.5 lg:mt-2 ' +
  'min-h-[22px] lg:min-h-[28px]';

export const PRODUCT_CARD_SWATCH_ROW_CLASS =
  'scrollbar-none flex w-full items-center justify-start gap-1.5 lg:gap-2 overflow-x-auto ' +
  'min-h-[22px] lg:min-h-[28px]';

export const PRODUCT_CARD_INFO_OFFSET_CLASS = 'mt-[5px] lg:mt-[7px] pt-0';
export const PRODUCT_CARD_INFO_PADDING_CLASS = 'pb-2 lg:pb-3';

export const PRODUCT_CARD_TITLE_PRICE_GAP_CLASS = 'gap-[10px] lg:gap-[12px]';

export const PRODUCT_CARD_PRICE_TEXT_CLASS =
  'font-[700] text-brand-dark text-[12px] lg:text-base leading-none';

export const PRODUCT_CARD_DISCOUNT_PCT_CLASS =
  'inline-flex items-center justify-center text-[12px] lg:text-base font-bold text-white bg-brand-primary px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap';

/** Pill % giảm compact — sidebar / card nhỏ */
export const PRODUCT_CARD_DISCOUNT_PCT_COMPACT_CLASS =
  'inline-flex items-center justify-center text-[9px] font-bold text-white bg-brand-primary px-1 py-px rounded leading-none whitespace-nowrap';

/** Pill % giảm PDP — desktop cao 28px, nền xanh đậm (khớp greenmate_fe) */
export const PDP_DISCOUNT_PCT_CLASS =
  'inline-flex items-center justify-center text-xs font-bold text-white bg-brand-primary px-2 py-0.5 rounded-full leading-none whitespace-nowrap lg:h-[28px] lg:py-0 lg:px-2.5 lg:text-sm';

/**
 * Pill % giảm trong khung preview admin — ép px cố định (viewport admin ≥ lg làm lệch class responsive).
 *
 * @param {'mobile' | 'desktop' | undefined} previewMode
 * @param {'card' | 'pdp'} [variant]
 * @returns {string}
 */
export function getPreviewDiscountPctClass(previewMode, variant = 'card') {
  if (previewMode === 'mobile') {
    return variant === 'pdp'
      ? 'inline-flex items-center justify-center text-[12px] font-bold text-white bg-brand-primary px-2 py-0.5 rounded-full leading-none whitespace-nowrap'
      : 'inline-flex items-center justify-center text-[12px] font-bold text-white bg-brand-primary px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap';
  }

  if (previewMode === 'desktop') {
    return variant === 'pdp'
      ? 'inline-flex items-center justify-center h-[28px] px-2.5 text-[14px] font-bold text-white bg-brand-primary rounded-full leading-none whitespace-nowrap'
      : 'inline-flex items-center justify-center text-[16px] font-bold text-white bg-brand-primary px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap';
  }

  return variant === 'pdp' ? PDP_DISCOUNT_PCT_CLASS : PRODUCT_CARD_DISCOUNT_PCT_CLASS;
}

export const PRODUCT_CARD_SWATCH_MORE_CLASS = productCardSwatchMoreClass();
