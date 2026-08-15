import { resolvePreviewVoucherStripFromApi } from '@/lib/products/productDisplay';
import { resolveProductThumb } from '@/lib/products/productImages';
import { eligibleVoucherToProductVoucher } from '@/lib/products/productVoucherPicker';
import {
  ensureVariationDisplayModes,
  findOverlayVariationIndex,
  getDefaultVariationDisplayMode,
  normalizeDisplayModeValue,
} from '@/lib/products/variationDisplay';
import { applyVoucherToSkuPrice } from '@/lib/vouchers/voucherPricePreview';

/**
 * Chuẩn hóa product từ API trước khi đưa vào ProductPreviewCard.
 * @param {object} product
 * @returns {object}
 */
export function normalizeProductForPreview(product) {
  if (!product) return product;

  const variations = (product.product_variations ?? [])
    .filter((v) => v?.name && Array.isArray(v.options) && v.options.length > 0)
    .map((v, i, arr) => ({
      ...v,
      display_mode: normalizeDisplayModeValue(
        v.display_mode ?? getDefaultVariationDisplayMode(i, arr.length),
      ),
    }));

  const skus = (product.product_skus ?? []).map((sku) => ({
    ...sku,
    sku_tier_idx: (sku.sku_tier_idx ?? []).map(Number),
    sku_images: (sku.sku_images ?? []).filter(Boolean),
    sku_videos: (sku.sku_videos ?? []).filter(Boolean),
    sku_stock: Number(sku.sku_stock ?? 0),
    sku_price: Number(sku.sku_price ?? 0),
    sku_price_sale: sku.sku_price_sale != null ? Number(sku.sku_price_sale) : null,
    sku_price_final: sku.sku_price_final != null ? Number(sku.sku_price_final) : null,
  }));

  const defaultSku = skus.find((s) => s.is_default) ?? skus[0] ?? null;
  const tierFromSku = defaultSku?.sku_tier_idx ?? [];
  const initialTierIdx = variations.map((_, i) => tierFromSku[i] ?? 0);

  return {
    ...product,
    product_variations: variations,
    product_skus: skus,
    product_price_min: product.product_price_min ?? product.product_price ?? 0,
    product_price_max: product.product_price_max ?? product.product_price ?? 0,
    has_discount: Boolean(product.has_discount),
    product_discount_percentage: Number(product.product_discount_percentage ?? 0),
    /** Chỉ strip voucher khi `has_voucher_discount` + `active_voucher` từ API */
    product_voucher: resolvePreviewVoucherStripFromApi(product),
    _previewInitialTierIdx: initialTierIdx,
  };
}

/**
 * Giá hiển thị trên ProductCard — giá gốc, giá khách (final), % giảm.
 * Badge % = tổng giảm gốc → giá khách (sale SKU + voucher).
 *
 * @param {object | null | undefined} selectedSku
 * @param {object} product
 */
export function resolveProductCardPricing(selectedSku, product) {
  const basePrice = Number(selectedSku?.sku_price ?? product.product_price_min ?? 0);
  const storedSale = Number(selectedSku?.sku_price_sale ?? 0);
  const hasStoredSale = storedSale > 0 && storedSale < basePrice;
  const finalPrice = selectedSku?.sku_price_final != null
    ? Number(selectedSku.sku_price_final)
    : hasStoredSale
      ? storedSale
      : basePrice;

  const displayPrice = basePrice;
  const displaySale = finalPrice > 0 && finalPrice < basePrice ? finalPrice : null;

  /** Badge % = tổng giảm từ giá gốc → giá khách (sale SKU + voucher cộng dồn) */
  const discountPct = displaySale != null && basePrice > 0
    ? Math.round((1 - displaySale / basePrice) * 100)
    : 0;

  return { displayPrice, displaySale, discountPct };
}

/**
 * Gom mọi URL ảnh của sản phẩm (thumb + SKU).
 * @param {object} product
 * @returns {string[]}
 */
export function collectProductImages(product) {
  const set = new Set();
  if (product?.product_thumb) set.add(product.product_thumb);
  for (const sku of product?.product_skus ?? []) {
    for (const img of sku.sku_images ?? []) {
      if (img) set.add(img);
    }
  }
  return [...set];
}

/** @param {object | null | undefined} sku */
export function getSkuKey(sku) {
  if (!sku) return '';
  return String(sku._id ?? sku.sku_code ?? '');
}

/**
 * Ảnh gallery theo SKU — ưu tiên `sku_images` từ API, fallback `product_thumb`.
 * @param {object | null | undefined} sku
 * @param {string | null | undefined} productThumb
 * @returns {string[]}
 */
export function resolveSkuGalleryImages(sku, productThumb) {
  const images = (sku?.sku_images ?? []).filter(Boolean);
  if (images.length) return images;
  if (productThumb) return [productThumb];
  return [];
}

/**
 * Video gallery theo SKU — tối đa 1 URL.
 * @param {object | null | undefined} sku
 * @returns {string | null}
 */
export function resolveSkuGalleryVideo(sku) {
  const video = (sku?.sku_videos ?? []).find(Boolean);
  return video ?? null;
}

/** mediaIndex 0 = video khi SKU có video */
export function isSkuGalleryVideoIndex(mediaIndex, videoUrl) {
  return Boolean(videoUrl) && mediaIndex === 0;
}

/** Map index thư viện → index trong mảng sku_images */
export function skuGalleryMediaIndexToImageIndex(mediaIndex, videoUrl) {
  if (!videoUrl) return mediaIndex;
  return mediaIndex - 1;
}

/** Tổng số item media (video + ảnh) */
export function countSkuGalleryMediaItems(videoUrl, images = []) {
  return (videoUrl ? 1 : 0) + images.filter(Boolean).length;
}

/**
 * @param {object | null | undefined} sku
 * @param {object[]} variations
 */
export function buildSkuTierLabel(sku, variations = []) {
  return (sku?.sku_tier_idx ?? [])
    .map((idx, vi) => variations[vi]?.options?.[idx])
    .filter(Boolean)
    .join(' / ') || sku?.sku_code || '—';
}

/**
 * Các chiều phân loại của SKU — tên nhóm + giá trị option.
 * @param {object | null | undefined} sku
 * @param {object[]} variations
 * @returns {{ name: string, value: string }[]}
 */
export function buildSkuTierParts(sku, variations = []) {
  return (sku?.sku_tier_idx ?? [])
    .map((idx, vi) => {
      const value = variations[vi]?.options?.[idx];
      if (!value) return null;
      const name = variations[vi]?.name?.trim() || `Phân loại ${vi + 1}`;
      return { name, value };
    })
    .filter(Boolean);
}

/**
 * Nhãn radio chọn SKU mặc định — VD: "250/Nhựa".
 * @param {{ name: string, value: string }[]} tierParts
 * @returns {string}
 */
export function buildSkuDefaultSelectLabel(tierParts = []) {
  if (!tierParts.length) return '—';
  return tierParts.map((p) => p.value).join('/');
}

/**
 * Tìm SKU khớp tier — fallback partial match nếu thiếu chiều.
 * @param {object[]} skus
 * @param {number[]} tierIdx
 */
export function findSkuByTier(skus, tierIdx) {
  const exact = skus.find(
    (s) =>
      s.sku_tier_idx?.length === tierIdx.length &&
      s.sku_tier_idx.every((v, i) => v === tierIdx[i]),
  );
  if (exact) return exact;

  if (!tierIdx.length) return skus[0] ?? null;

  return (
    skus.find((s) =>
      tierIdx.every((v, i) => s.sku_tier_idx?.[i] === v),
    ) ?? skus[0] ?? null
  );
}

/**
 * Bố cục variation cho ProductCard theo `display_mode` từng nhóm.
 * @param {object[]} variations
 * @param {number} skuCount
 */
export function resolveVariationLayout(variations, skuCount) {
  if (!skuCount || !variations?.length) {
    return { overlay: null, overlayVarIdx: -1, swatchRows: [] };
  }

  if (variations.length === 1) {
    return {
      overlay: null,
      overlayVarIdx: -1,
      swatchRows: [{ variation: variations[0], varIdx: 0 }],
    };
  }

  const overlayVarIdx = findOverlayVariationIndex(variations);

  return {
    overlay: variations[overlayVarIdx],
    overlayVarIdx,
    swatchRows: variations
      .map((variation, varIdx) => ({ variation, varIdx }))
      .filter((row) => row.varIdx !== overlayVarIdx),
  };
}

/**
 * Vai trò hiển thị từng nhóm phân loại trên card cửa hàng.
 * @param {number} index
 * @param {number} total
 * @param {string} [displayMode]
 * @returns {{ mode: 'overlay' | 'swatch', label: string, hint: string }}
 */
export function getVariationStorefrontRole(index, total, displayMode) {
  if (total <= 0) {
    return { mode: 'swatch', label: '', hint: '' };
  }

  const mode = normalizeDisplayModeValue(
    displayMode ?? getDefaultVariationDisplayMode(index, total),
  );

  if (total === 1 || mode === 'swatch') {
    return {
      mode: 'swatch',
      label: 'Nút dưới ảnh',
      hint: '',
    };
  }

  return {
    mode: 'overlay',
    label: 'Overlay',
    hint: '',
  };
}

/**
 * Tính sku_price_final trên form preview — khớp tipjs resolveSkuCustomerPricing (voucher toàn shop).
 * @param {object[]} skus
 * @param {object | null | undefined} selectedVoucher
 */
function mapSkusWithVoucherPreview(skus, selectedVoucher) {
  if (!selectedVoucher?.code) return skus;

  const discount = {
    discount_type: selectedVoucher.type ?? 'percentage',
    discount_value: selectedVoucher.value ?? 0,
  };

  return skus.map((sku) => {
    const basePrice = Number(sku.sku_price ?? 0);
    const storedSale = Number(sku.sku_price_sale ?? 0);
    const sellingPrice = storedSale > 0 && storedSale < basePrice ? storedSale : basePrice;
    const { after } = applyVoucherToSkuPrice(sellingPrice, discount);
    const finalPrice = Math.round(after);

    if (finalPrice > 0 && finalPrice < basePrice) {
      return { ...sku, sku_price_final: finalPrice };
    }
    return sku;
  });
}

/**
 * Dựng object preview card cửa hàng từ state form đang nhập (create/edit).
 * @param {{
 *   productName?: string,
 *   thumbUrl?: string,
 *   variations?: object[],
 *   skus?: object[],
 *   badgeType?: string,
 *   badgeText?: string,
 *   selectedVoucher?: object | null,
 *   minSkuPrice?: number,
 * }} params
 */
export function buildProductPreviewFromFormDraft({
  productName,
  thumbUrl,
  variations = [],
  skus = [],
  badgeType,
  badgeText,
  selectedVoucher,
  minSkuPrice = 0,
}) {
  const validVariations = ensureVariationDisplayModes(
    variations.filter((v) => v.name?.trim() && v.options?.length),
  );
  const thumb = resolveProductThumb(thumbUrl, skus);
  const previewSkus = mapSkusWithVoucherPreview(skus, selectedVoucher);

  const basePrices = previewSkus
    .map((s) => Number(s.sku_price ?? 0))
    .filter((p) => p >= 1000);
  const customerPrices = previewSkus
    .map((s) => {
      const base = Number(s.sku_price ?? 0);
      if (s.sku_price_final != null && s.sku_price_final < base) {
        return Number(s.sku_price_final);
      }
      const sale = Number(s.sku_price_sale ?? 0);
      if (sale > 0 && sale < base) return sale;
      return base;
    })
    .filter((p) => p >= 1000);

  const priceMin = customerPrices.length ? Math.min(...customerPrices) : minSkuPrice;
  const priceMax = basePrices.length ? Math.max(...basePrices) : priceMin;

  const hasSkuSale = previewSkus.some((s) => {
    const base = Number(s.sku_price ?? 0);
    const sale = Number(s.sku_price_sale ?? 0);
    const final = Number(s.sku_price_final ?? 0);
    return (sale > 0 && sale < base) || (final > 0 && final < base);
  });

  const raw = {
    product_name: productName?.trim() || 'Tên sản phẩm',
    product_thumb: thumb,
    product_variations: validVariations,
    product_skus: previewSkus,
    product_price_min: priceMin,
    product_price_max: priceMax,
    has_discount: hasSkuSale || Boolean(selectedVoucher?.code),
    product_discount_percentage: 0,
    product_badge: badgeType
      ? { badge_type: badgeType, text: badgeText?.trim() || '' }
      : { badge_type: 'none', text: '' },
  };

  const normalized = normalizeProductForPreview(raw);
  const voucherStrip = eligibleVoucherToProductVoucher(selectedVoucher);

  if (voucherStrip?.code) {
    return {
      ...normalized,
      product_voucher: voucherStrip,
      has_voucher_discount: true,
    };
  }

  return normalized;
}
