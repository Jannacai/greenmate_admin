/**
 * Class UI ProductCard preview admin — ép mobile/desktop vì breakpoint Tailwind
 * theo viewport (màn admin rộng), không theo khung preview.
 * Dùng px cố định — admin html 18px làm lệch rem so với FE 16px.
 *
 * @param {'mobile' | 'desktop' | undefined} previewMode
 */
export function getProductCardPreviewUi(previewMode) {
  const mobile = previewMode === 'mobile';
  const desktop = previewMode === 'desktop';
  const responsive = !previewMode;

  return {
    imageHeight: mobile
      ? 'aspect-[3/4]'
      : desktop
        ? 'aspect-[4/5]'
        : 'aspect-[3/4] lg:aspect-[4/5]',

    /** FE mobile text-xs @16px · desktop text-base @16px */
    title: mobile
      ? 'text-[12px] font-semibold leading-none'
      : desktop
        ? 'text-[16px] font-semibold leading-none'
        : 'text-xs lg:text-base font-semibold leading-none',

    price: mobile
      ? 'text-[12px] font-[700]'
      : desktop
        ? 'text-[16px] font-[700]'
        : 'text-[12px] lg:text-base font-[700]',

    /** @deprecated Dùng getPreviewDiscountPctClass — giữ alias tương thích */
    discountPct: mobile
      ? 'text-[12px] font-bold'
      : desktop
        ? 'text-[16px] font-bold'
        : 'text-[12px] lg:text-base font-bold',

    strikethrough: mobile
      ? 'text-[12px]'
      : desktop
        ? 'text-[14px]'
        : 'text-xs lg:text-sm',

    swatchH: mobile ? 'h-[22px]' : desktop ? 'h-[28px]' : 'h-[22px] lg:h-[28px]',
    swatchPx: mobile ? 'px-2' : desktop ? 'px-3.5' : 'px-2 lg:px-3.5',
    swatchText: mobile ? 'text-[10px]' : desktop ? 'text-[12px]' : 'text-[10px] lg:text-xs',
    swatchGap: mobile ? 'gap-1.5' : desktop ? 'gap-2' : 'gap-1.5 lg:gap-2',
    swatchZoneMt: mobile ? 'mt-1.5' : desktop ? 'mt-2' : 'mt-1.5 lg:mt-2',
    swatchMinH: mobile ? 'min-h-[22px]' : desktop ? 'min-h-[28px]' : 'min-h-[22px] lg:min-h-[28px]',
    infoMt: mobile ? 'mt-[5px]' : desktop ? 'mt-[7px]' : 'mt-[5px] lg:mt-[7px]',
    titlePriceGap: mobile ? 'gap-[10px]' : desktop ? 'gap-[12px]' : 'gap-[10px] lg:gap-[12px]',

    hideSwatchOnMobile: mobile ? false : desktop ? true : false,
    showSwatchOnDesktop: desktop ? true : responsive,

    quickAddVisible: mobile || (responsive && 'lg:hidden'),
    quickAddHidden: desktop,

    overlayText: mobile ? 'text-[12px]' : desktop ? 'text-[14px]' : 'text-xs lg:text-sm',

    priceRange: mobile ? 'text-[10px]' : desktop ? 'text-[12px]' : 'text-[10px] lg:text-xs',

    imageSizes: mobile
      ? '173px'
      : desktop
        ? '305px'
        : '(max-width: 1023px) calc((100vw - 42px) / 2), calc(min(100vw, 1440px) / 4 - 40px)',
  };
}

/** Reset rem context khớp FE storefront (16px) — admin html 18px */
export const STOREFRONT_PREVIEW_MOBILE_CLASS = 'storefront-preview-mobile';
export const STOREFRONT_PREVIEW_DESKTOP_CLASS = 'storefront-preview-desktop';

export function getStorefrontPreviewFrameClass(previewMode) {
  if (previewMode === 'mobile') return STOREFRONT_PREVIEW_MOBILE_CLASS;
  if (previewMode === 'desktop') return STOREFRONT_PREVIEW_DESKTOP_CLASS;
  return '';
}
