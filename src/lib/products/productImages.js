import { getCanonicalStorageUrl } from '@/lib/shared/image';

/** Tỉ lệ ảnh chi tiết / PDP — khớp ProductSkuImageViewer (420×525) */
export const PRODUCT_IMAGE_ASPECT_CLASS = 'aspect-[4/5]';

/** Khớp greenmate_fe ProductCard — cột card desktop ~305px */
export const PRODUCT_CARD_MAX_WIDTH_CLASS = 'max-w-[305px]';

/**
 * Tỉ lệ khung ảnh ProductCard — đồng bộ greenmate_fe breakpoints.js
 */
export const PRODUCT_CARD_IMAGE_HEIGHT_CLASS = 'aspect-[3/4] lg:aspect-[4/5]';

export const PRODUCT_CARD_IMAGE_SIZES =
  '(max-width: 1023px) calc((100vw - 42px) / 2), calc(min(100vw, 1440px) / 4 - 40px)';

/**
 * Tỉ lệ khung ảnh ProductCard — ~3:4 mobile · 4:5 desktop (alias preview cũ).
 */
export const PRODUCT_CARD_IMAGE_RATIO_CLASS = PRODUCT_CARD_IMAGE_HEIGHT_CLASS;

/**
 * Gom mọi URL ảnh từ thumb + SKUs.
 * @param {string} thumbUrl
 * @param {object[]} skus
 * @returns {string[]}
 */
export function collectFormImageUrls(thumbUrl, skus = []) {
  const set = new Set();
  const thumb = getCanonicalStorageUrl(thumbUrl);
  if (thumb) set.add(thumb);

  for (const sku of skus) {
    for (const img of sku.sku_images ?? []) {
      const canonical = getCanonicalStorageUrl(img);
      if (canonical) set.add(canonical);
    }
  }

  return [...set];
}

/**
 * URL đã bỏ khỏi form (cần kiểm tra orphan).
 * @param {string[]} previousUrls
 * @param {string[]} currentUrls
 * @returns {string[]}
 */
export function diffRemovedImageUrls(previousUrls, currentUrls) {
  const current = new Set(currentUrls.map(getCanonicalStorageUrl));
  return previousUrls
    .map(getCanonicalStorageUrl)
    .filter((url) => url && !current.has(url));
}

/**
 * Ảnh 1 của SKU mặc định (is_default), không có thì SKU đầu tiên có ảnh.
 * @param {object[]} skus
 * @returns {string}
 */
export function resolveDefaultThumbFromSkus(skus = []) {
  const ordered = [];
  const defaultSku = skus.find((s) => s.is_default);
  if (defaultSku) ordered.push(defaultSku);
  for (const sku of skus) {
    if (sku !== defaultSku) ordered.push(sku);
  }
  for (const sku of ordered) {
    const url = getCanonicalStorageUrl(sku.sku_images?.[0]);
    if (url) return url;
  }
  return '';
}

/**
 * product_thumb: ưu tiên upload thủ công, không có thì lấy từ SKU mặc định.
 * @param {string} manualThumb
 * @param {object[]} skus
 * @returns {string}
 */
export function resolveProductThumb(manualThumb, skus = []) {
  const manual = getCanonicalStorageUrl(manualThumb);
  if (manual) return manual;
  return resolveDefaultThumbFromSkus(skus);
}

/**
 * Gom URL video từ SKUs.
 * @param {object[]} skus
 * @returns {string[]}
 */
export function collectFormVideoUrls(skus = []) {
  const set = new Set();

  for (const sku of skus) {
    for (const video of sku.sku_videos ?? []) {
      const canonical = getCanonicalStorageUrl(video);
      if (canonical) set.add(canonical);
    }
  }

  return [...set];
}

/**
 * Gom URL video từ product API (edit form baseline).
 * @param {object} product
 * @returns {string[]}
 */
export function collectProductVideoUrls(product) {
  if (!product) return [];
  return collectFormVideoUrls(product.product_skus ?? []);
}

/**
 * URL media đã bỏ khỏi form (dùng chung ảnh/video).
 * @param {string[]} previousUrls
 * @param {string[]} currentUrls
 * @returns {string[]}
 */
export function diffRemovedMediaUrls(previousUrls, currentUrls) {
  const current = new Set(currentUrls.map(getCanonicalStorageUrl));
  return previousUrls
    .map(getCanonicalStorageUrl)
    .filter((url) => url && !current.has(url));
}

/**
 * Gom URL từ product API (edit form baseline).
 * @param {object} product
 * @returns {string[]}
 */
export function collectProductImageUrls(product) {
  if (!product) return [];
  return collectFormImageUrls(product.product_thumb, product.product_skus ?? []);
}

/** @param {string} url */
export function isVideoStorageUrl(url) {
  return typeof url === 'string' && url.includes('/video/upload/');
}
