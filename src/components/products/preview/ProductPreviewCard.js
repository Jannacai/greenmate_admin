'use client';

import { createPortal } from 'react-dom';
import { useState, useMemo, useCallback, useEffect } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import StorefrontProductBadge from '@/components/products/preview/StorefrontProductBadge';
import StorefrontProductVoucherStrip, {
  VOUCHER_STRIP_MOBILE_BOTTOM_CLASS,
} from '@/components/products/preview/StorefrontProductVoucherStrip';
import SkuGalleryVideoPlayer from '@/components/products/preview/SkuGalleryVideoPlayer';
import {
  collectProductImages,
  findSkuByTier,
  resolveProductCardPricing,
  resolveVariationLayout,
  resolveSkuGalleryVideo,
  isSkuGalleryVideoIndex,
  skuGalleryMediaIndexToImageIndex,
} from '@/lib/products/productPreview';
import { getProductCardPreviewUi } from '@/lib/products/productCardPreviewUi';
import {
  PRODUCT_CARD_DISCOUNT_PCT_CLASS,
  PRODUCT_CARD_PRICE_TEXT_CLASS,
  PRODUCT_CARD_TITLE_PRICE_GAP_CLASS,
  PRODUCT_CARD_VARIATION_TEXT_CLASS,
  getPreviewDiscountPctClass,
  getProductCardSwatchRowClass,
  getProductCardSwatchZoneClass,
  productCardSwatchClass,
  productCardSwatchMoreClass,
  PRODUCT_CARD_INFO_OFFSET_CLASS,
  PRODUCT_CARD_INFO_PADDING_CLASS,
} from '@/lib/products/variationDisplay';
import { PRODUCT_CARD_IMAGE_HEIGHT_CLASS, PRODUCT_CARD_IMAGE_SIZES } from '@/lib/products/productImages';
import { cn } from '@/lib/shared/utils';

function isOptionAvailable(skus, currentTierIdx, varIdx, optIdx) {
  const testTier = [...currentTierIdx];
  testTier[varIdx] = optIdx;
  const sku = findSkuByTier(skus, testTier);
  return Boolean(sku);
}

function tierLabel(variations, tierIdx) {
  return tierIdx
    .map((idx, vi) => variations[vi]?.options?.[idx])
    .filter(Boolean)
    .join(' / ');
}

function swatchHiddenClass(previewMode, optIdx, expanded, mobileLimit) {
  if (expanded || optIdx < mobileLimit) return '';
  if (previewMode === 'mobile') return 'hidden';
  if (previewMode === 'desktop') return 'inline-flex';
  return 'hidden lg:inline-flex';
}

function moreButtonHiddenClass(previewMode) {
  if (previewMode === 'desktop') return 'hidden';
  if (previewMode === 'mobile') return 'lg:hidden';
  return 'lg:hidden';
}

function PriceBlock({ price, priceSale, discountPct, ui, previewMode }) {
  const fmt = (n) => n?.toLocaleString('vi-VN') ?? '—';
  const hasSale = priceSale != null && priceSale < price;

  const priceClass = previewMode
    ? cn('text-brand-dark leading-none', ui.price)
    : cn(PRODUCT_CARD_PRICE_TEXT_CLASS, ui.price);

  const discountClass = getPreviewDiscountPctClass(previewMode, 'card');

  const strikeClass = previewMode
    ? cn('text-gray-400 line-through leading-none font-medium', ui.strikethrough)
    : 'text-xs lg:text-sm text-gray-400 line-through leading-none font-medium';

  if (hasSale) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={priceClass}>
          {fmt(priceSale)}đ
        </span>
        {discountPct > 0 && (
          <span className={discountClass}>
            -{discountPct}%
          </span>
        )}
        <span className={strikeClass}>
          {fmt(price)}đ
        </span>
      </div>
    );
  }

  return (
    <p className={priceClass}>
      {fmt(price)}đ
    </p>
  );
}

function VariationSwatches({
  variation,
  varIdx,
  skus,
  selectedTierIdx,
  onSelectOption,
  previewMode,
}) {
  const [expanded, setExpanded] = useState(false);
  if (!variation?.options?.length) return null;

  const MOBILE_LIMIT = 2;
  const hasMore = variation.options.length > MOBILE_LIMIT;
  const extraCount = variation.options.length - MOBILE_LIMIT;

  return (
    <div className={cn(getProductCardSwatchRowClass(previewMode), expanded && 'flex-wrap')}>
      {variation.options.map((option, optIdx) => {
        const isSelected = selectedTierIdx[varIdx] === optIdx;
        const isAvailable = isOptionAvailable(skus, selectedTierIdx, varIdx, optIdx);

        return (
          <button
            key={`${varIdx}-${optIdx}`}
            type="button"
            disabled={!isAvailable}
            title={option || variation.name}
            onClick={() => onSelectOption(varIdx, optIdx)}
            className={productCardSwatchClass(
              isSelected,
              cn(
                swatchHiddenClass(previewMode, optIdx, expanded, MOBILE_LIMIT),
                !isAvailable && 'opacity-35 line-through cursor-not-allowed pointer-events-none',
              ),
              previewMode,
            )}
          >
            {option}
          </button>
        );
      })}

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(moreButtonHiddenClass(previewMode), productCardSwatchMoreClass(previewMode))}
        >
          +{extraCount}
        </button>
      )}
    </div>
  );
}

function SizeOverlay({ visible, variation, varIdx, skus, selectedTierIdx, onSelectOption, ui }) {
  if (!variation?.options?.length) return null;

  return (
    <div
      className={cn(
        'absolute bottom-[10px] left-[10px] right-[10px] z-20',
        'h-[130px] bg-white/55 backdrop-blur-md rounded-2xl',
        'px-4 pt-3 pb-4 flex flex-col justify-between',
        'transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : 'translate-y-[calc(100%+10px)]',
      )}
    >
      <p className={cn('font-bold text-brand-dark tracking-tight', ui.overlayText)}>
        Thêm nhanh vào giỏ hàng +
      </p>
      <div className="flex flex-wrap gap-2">
        {variation.options.map((option, optIdx) => {
          const isSelected = selectedTierIdx[varIdx] === optIdx;
          const isAvailable = isOptionAvailable(skus, selectedTierIdx, varIdx, optIdx);

          return (
            <button
              key={option}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectOption(varIdx, optIdx)}
              className={cn(
                'min-w-[58px] h-[38px] px-3 rounded-xl border font-semibold transition-all duration-150',
                PRODUCT_CARD_VARIATION_TEXT_CLASS,
                ui.overlayText,
                isSelected
                  ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-brand-primary hover:text-brand-primary',
                !isAvailable && 'opacity-40 cursor-not-allowed pointer-events-none border-dashed line-through text-gray-400',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuickAddSheet({
  show,
  onClose,
  product,
  selectedTierIdx,
  onSelectOption,
  overlayVariation,
  overlayVarIdx,
  previewMode,
}) {
  const { product_skus } = product;
  const primaryVariation = overlayVariation ?? product.product_variations?.[0];

  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!primaryVariation) return null;
  if (previewMode === 'desktop') return null;

  const varIdx = overlayVarIdx >= 0 ? overlayVarIdx : 0;
  const sheetHidden = previewMode === 'mobile' ? '' : 'lg:hidden';

  const content = (
    <>
      <div
        className={cn(
          sheetHidden,
          'fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300',
          show ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          sheetHidden,
          'fixed bottom-0 left-0 right-0 z-[101]',
          'bg-white rounded-t-2xl px-4 pt-5 pb-8',
          'transition-transform duration-300 ease-out',
          show ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold"
        >
          ✕
        </button>
        <h3 className="text-sm font-semibold text-brand-dark pr-10">
          Thêm nhanh vào giỏ hàng <span className="text-brand-primary">+</span>
        </h3>
        <p className="text-xs text-brand-primary mt-0.5">
          Chọn {primaryVariation.name} của bạn
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {primaryVariation.options.map((option, optIdx) => {
            const isSelected = selectedTierIdx[varIdx] === optIdx;
            const isAvailable = isOptionAvailable(product_skus, selectedTierIdx, varIdx, optIdx);
            return (
              <button
                key={option}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectOption(varIdx, optIdx)}
                className={cn(
                  'h-10 px-4 rounded-xl border text-sm font-semibold transition-all duration-150',
                  isSelected
                    ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand-primary hover:text-brand-primary',
                  !isAvailable && 'opacity-40 line-through cursor-not-allowed pointer-events-none border-dashed',
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full h-12 rounded-xl bg-brand-primary text-white text-sm font-semibold tracking-wide active:opacity-80 transition-opacity"
        >
          Thêm vào giỏ hàng
        </button>
      </div>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}

/**
 * ProductCard preview — đồng bộ greenmate_fe ProductCard.js
 *
 * @param {{
 *   product: object,
 *   className?: string,
 *   compact?: boolean,
 *   previewMode?: 'mobile' | 'desktop',
 *   showAdminMeta?: boolean,
 *   tierIdx?: number[],
 *   onTierIdxChange?: (tierIdx: number[]) => void,
 *   galleryImageIndex?: number,
 *   onMainImageClick?: (src: string) => void,
 * }} props
 */
export default function ProductPreviewCard({
  product,
  className,
  compact = false,
  previewMode: previewModeProp,
  showAdminMeta = true,
  tierIdx: controlledTierIdx,
  onTierIdxChange,
  galleryImageIndex = 0,
  onMainImageClick,
}) {
  const previewMode = previewModeProp ?? (compact ? 'desktop' : undefined);
  const ui = getProductCardPreviewUi(previewMode);

  const {
    product_name,
    product_price_min,
    product_price_max,
    product_thumb,
    has_discount,
    product_discount_percentage,
    product_badge,
    product_voucher,
    product_variations = [],
    product_skus = [],
    _previewInitialTierIdx,
  } = product;

  const layout = useMemo(
    () => resolveVariationLayout(product_variations, product_skus.length),
    [product_variations, product_skus.length],
  );

  const allImages = useMemo(() => collectProductImages(product), [product]);

  const defaultSku = useMemo(
    () => product_skus.find((s) => s.is_default) ?? product_skus[0] ?? null,
    [product_skus],
  );

  const buildInitialTier = useCallback(() => {
    if (_previewInitialTierIdx?.length) return [..._previewInitialTierIdx];
    const tier = defaultSku?.sku_tier_idx ?? [];
    return product_variations.map((_, i) => tier[i] ?? 0);
  }, [_previewInitialTierIdx, defaultSku, product_variations]);

  const [internalTierIdx, setInternalTierIdx] = useState(buildInitialTier);
  const isTierControlled = controlledTierIdx != null;
  const selectedTierIdx = isTierControlled ? controlledTierIdx : internalTierIdx;
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    if (!isTierControlled) {
      setInternalTierIdx(buildInitialTier());
    }
  }, [buildInitialTier, isTierControlled]);

  const updateTierIdx = useCallback((next) => {
    const value = typeof next === 'function' ? next(selectedTierIdx) : next;
    if (!isTierControlled) {
      setInternalTierIdx(value);
    }
    onTierIdxChange?.(value);
  }, [isTierControlled, onTierIdxChange, selectedTierIdx]);

  const selectedSku = useMemo(
    () => findSkuByTier(product_skus, selectedTierIdx),
    [product_skus, selectedTierIdx],
  );

  const handleSelectOption = useCallback((varIdx, optIdx) => {
    updateTierIdx((prev) => {
      const next = product_variations.map((_, i) => prev[i] ?? 0);
      next[varIdx] = optIdx;
      return next;
    });
  }, [product_variations, updateTierIdx]);

  const skuImages = useMemo(
    () => (selectedSku?.sku_images ?? []).filter(Boolean),
    [selectedSku],
  );

  const galleryVideo = useMemo(
    () => resolveSkuGalleryVideo(selectedSku),
    [selectedSku],
  );

  const showingVideo = isSkuGalleryVideoIndex(galleryImageIndex, galleryVideo);
  const imageIndex = skuGalleryMediaIndexToImageIndex(galleryImageIndex, galleryVideo);
  const safeImageIndex = skuImages.length
    ? Math.min(Math.max(0, imageIndex), skuImages.length - 1)
    : 0;
  const mainImage = showingVideo ? null : (skuImages[safeImageIndex] ?? product_thumb);
  const hoverFromSku = showingVideo
    ? null
    : (skuImages[safeImageIndex + 1]
      ?? skuImages.find((img, i) => i !== safeImageIndex)
      ?? null);
  const hoverFallback = allImages.find((img) => img && img !== mainImage) ?? null;
  const hoverImage = !showingVideo && hoverFromSku && hoverFromSku !== mainImage ? hoverFromSku : hoverFallback;
  const hasHoverImg = Boolean(hoverImage) && !showingVideo;

  const hasSizeOverlay = Boolean(layout.overlay);
  const hasSwatchRows = layout.swatchRows.length > 0;
  const canInteract = product_skus.length > 0 && product_variations.length > 0;

  const { displayPrice, displaySale, discountPct } = useMemo(
    () => resolveProductCardPricing(selectedSku, {
      product_price_min,
      has_discount,
      product_discount_percentage,
    }),
    [selectedSku, product_price_min, has_discount, product_discount_percentage],
  );

  const cardImageSizes = previewMode
    ? ui.imageSizes
    : compact
      ? '305px'
      : PRODUCT_CARD_IMAGE_SIZES;

  const imageHeightClass = previewMode
    ? ui.imageHeight
    : compact
      ? PRODUCT_CARD_IMAGE_HEIGHT_CLASS
      : ui.imageHeight;

  const quickAddBtnClass = previewMode === 'desktop'
    ? 'hidden'
    : previewMode === 'mobile'
      ? 'absolute right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-brand-primary shadow-lg backdrop-blur-sm active:scale-90 transition-transform'
      : cn(
          'lg:hidden absolute right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full',
          'bg-white/30 text-brand-primary shadow-lg backdrop-blur-sm active:scale-90 transition-transform',
        );

  return (
    <article className={cn('storefront-product-card flex flex-col bg-white rounded-xl overflow-visible', className)}>
      {!canInteract && (
        <div className="border-b border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 leading-snug">
          {product_variations.length > 0 && product_skus.length === 0
            ? 'Sản phẩm có phân loại nhưng chưa có SKU — tạo lại sản phẩm hoặc thêm SKU để xem tương tác biến thể.'
            : 'Thêm ít nhất 1 variation + SKU (có ảnh) để preview hover và chọn biến thể.'}
        </div>
      )}

      <div
        className={cn(
          'group relative w-full flex-shrink-0 overflow-hidden rounded-xl',
          imageHeightClass,
          onMainImageClick && mainImage && !showingVideo && 'cursor-zoom-in',
        )}
        onMouseEnter={() => !showingVideo && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (!onMainImageClick || !mainImage || showingVideo) return;
          if (e.target instanceof Element && e.target.closest('button')) return;
          onMainImageClick(mainImage);
        }}
        onKeyDown={(e) => {
          if (!onMainImageClick || !mainImage || showingVideo) return;
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          onMainImageClick(mainImage);
        }}
        role={onMainImageClick && mainImage && !showingVideo ? 'button' : undefined}
        tabIndex={onMainImageClick && mainImage && !showingVideo ? 0 : undefined}
        aria-label={onMainImageClick && mainImage && !showingVideo ? `Phóng to ảnh — ${product_name}` : undefined}
      >
        <div className="block w-full h-full relative" aria-label={product_name}>
          {showingVideo && galleryVideo ? (
            <SkuGalleryVideoPlayer
              src={galleryVideo}
              className="absolute inset-0 h-full w-full"
              posterPreset="card"
              active
            />
          ) : mainImage ? (
            <OptimizedImage
              src={mainImage}
              alt={product_name}
              preset="card"
              sizes={cardImageSizes}
              priority
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                hasHoverImg && isHovered ? 'opacity-0' : 'opacity-100',
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
              Chưa có ảnh
            </div>
          )}

          {hasHoverImg && (
            <OptimizedImage
              src={hoverImage}
              alt={`${product_name} — góc khác`}
              preset="hover"
              sizes={cardImageSizes}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                isHovered ? 'opacity-100' : 'opacity-0',
              )}
            />
          )}
        </div>

        {hasHoverImg && !isHovered && canInteract && (
          <span className="pointer-events-none absolute top-2 left-2 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Hover đổi ảnh
          </span>
        )}

        <StorefrontProductBadge badge={product_badge} />

        <StorefrontProductVoucherStrip
          voucher={product_voucher}
          hidden={isHovered && hasSizeOverlay}
          compact={compact}
          previewMode={previewMode}
        />

        <button
          type="button"
          aria-label="Thêm vào giỏ hàng"
          onClick={() => setShowQuickAdd(true)}
          className={cn(quickAddBtnClass, VOUCHER_STRIP_MOBILE_BOTTOM_CLASS)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>

        {hasSizeOverlay && (
          <SizeOverlay
            visible={isHovered}
            variation={layout.overlay}
            varIdx={layout.overlayVarIdx}
            skus={product_skus}
            selectedTierIdx={selectedTierIdx}
            onSelectOption={handleSelectOption}
            ui={ui}
          />
        )}
      </div>

      {hasSwatchRows && (
        <div className={getProductCardSwatchZoneClass(previewMode)}>
          {layout.swatchRows.map(({ variation, varIdx }) => (
            <VariationSwatches
              key={variation.name + varIdx}
              variation={variation}
              varIdx={varIdx}
              skus={product_skus}
              selectedTierIdx={selectedTierIdx}
              onSelectOption={handleSelectOption}
              previewMode={previewMode}
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          'flex flex-col items-start text-left w-full',
          previewMode === 'mobile'
            ? 'mt-[5px] pb-2 pt-0'
            : previewMode === 'desktop'
              ? 'mt-[7px] pb-3 pt-0'
              : cn(PRODUCT_CARD_INFO_OFFSET_CLASS, PRODUCT_CARD_INFO_PADDING_CLASS),
        )}
      >
        <div className={cn(
          'flex flex-col w-full',
          previewMode === 'mobile'
            ? 'gap-[10px]'
            : previewMode === 'desktop'
              ? 'gap-[12px]'
              : PRODUCT_CARD_TITLE_PRICE_GAP_CLASS,
        )}>
          <p className={cn('font-semibold text-brand-dark line-clamp-2', ui.title)}>
            {product_name}
          </p>
          <PriceBlock
            price={displayPrice}
            priceSale={displaySale}
            discountPct={discountPct}
            ui={ui}
            previewMode={previewMode}
          />
        </div>
        {!selectedSku && product_price_min !== product_price_max && (
          <p className={cn('text-gray-400 mt-1', ui.priceRange)}>
            {product_price_min?.toLocaleString('vi-VN')}đ – {product_price_max?.toLocaleString('vi-VN')}đ
          </p>
        )}
      </div>

      {showAdminMeta && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 text-[10px] lg:text-xs text-gray-500">
          <span className="font-medium text-gray-600">Đang xem: </span>
          {tierLabel(product_variations, selectedTierIdx) || '—'}
          {selectedSku?.sku_code && (
            <span className="ml-1 font-mono text-gray-400">· {selectedSku.sku_code}</span>
          )}
          {selectedSku != null && (
            <span className="ml-1">· Tồn {selectedSku.sku_stock ?? 0}</span>
          )}
        </div>
      )}

      <QuickAddSheet
        show={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        product={product}
        selectedTierIdx={selectedTierIdx}
        onSelectOption={handleSelectOption}
        overlayVariation={layout.overlay ?? layout.swatchRows[0]?.variation}
        overlayVarIdx={layout.overlay ? layout.overlayVarIdx : layout.swatchRows[0]?.varIdx ?? 0}
        previewMode={previewMode}
      />
    </article>
  );
}
