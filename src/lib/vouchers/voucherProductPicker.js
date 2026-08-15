import { formatCurrency, normalizeSearchText, stringifyMongoId } from '@/lib/shared/utils';
import { normalizeProductForPreview } from '@/lib/products/productPreview';
import { pickProductCodeFromApi, pickSkuCodeFromApi } from '@/lib/products/productDisplay';
/**
 * Khóa voucher hẹp trên sản phẩm.
 * @param {string} productId
 * @param {Record<string, { code?: string, applies_to?: string }>} [narrowLocksByProduct]
 */
export function getProductNarrowVoucherLock(productId, narrowLocksByProduct = {}) {
  if (!productId) return null;
  return narrowLocksByProduct[String(productId)] ?? null;
}

/**
 * Chuẩn hóa product cho picker voucher (thumb, skus, variations).
 * @param {object} product
 */
export function normalizeProductForVoucherPicker(product) {
  return normalizeProductForPreview(product);
}

/**
 * Nhãn biến thể SKU từ tier_idx + variations.
 * @param {object} sku
 * @param {object[]} variations
 */
export function getSkuVariantLabel(sku, variations = []) {
  if (!variations?.length) {
    return sku.sku_code ?? 'Mặc định';
  }
  const label = (sku.sku_tier_idx ?? [])
    .map((idx, vi) => variations[vi]?.options?.[idx])
    .filter(Boolean)
    .join(' / ');
  return label || sku.sku_code || 'Biến thể';
}

/**
 * Giá hiển thị của SKU (ưu tiên giá sale nếu thấp hơn).
 * @param {object} sku
 */
export function getSkuDisplayPrice(sku) {
  const base = Number(sku.sku_price ?? 0);
  const sale = sku.sku_price_sale != null ? Number(sku.sku_price_sale) : null;
  if (sale != null && sale < base) {
    return { current: sale, original: base, onSale: true };
  }
  return { current: base, original: null, onSale: false };
}

/**
 * Giá hiển thị sản phẩm — min/max từ SKU hoặc product_price.
 * @param {object} product
 * @returns {string}
 */
export function getProductPriceDisplay(product) {
  const skus = (product.product_skus ?? []).filter((s) => s.is_active !== false);
  if (skus.length) {
    const prices = skus
      .map((s) => {
        const { current } = getSkuDisplayPrice(s);
        return current;
      })
      .filter((n) => n > 0);
    if (prices.length) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min === max) return formatCurrency(min);
      return `${formatCurrency(min)} – ${formatCurrency(max)}`;
    }
  }
  return formatCurrency(product.product_price ?? product.product_price_min ?? 0);
}

/**
 * Danh sách giá theo từng SKU — dùng scope voucher / picker.
 * @param {object} product
 * @returns {Array<{ skuId: string, skuCode: string | null, label: string, price: string, originalPrice: string | null }>}
 */
export function getProductSkuPriceLines(product) {
  const variations = product?.product_variations ?? [];
  const skus = (product?.product_skus ?? []).filter((s) => s.is_active !== false);

  if (!skus.length) {
    const amount = Number(product?.product_price ?? product?.product_price_min ?? 0);
    const fallback = formatCurrency(amount);
    const productCode = pickProductCodeFromApi(product);
    return [{
      skuId: stringifyMongoId(product?._id) || 'fallback',
      skuCode: productCode,
      label: 'Giá sản phẩm',
      price: fallback,
      priceAmount: amount,
      originalPrice: null,
    }];
  }

  return skus.map((sku) => {
    const { current, original, onSale } = getSkuDisplayPrice(sku);
    return {
      skuId: stringifyMongoId(sku._id),
      skuCode: pickSkuCodeFromApi(sku),
      label: getSkuVariantLabel(sku, variations),
      price: formatCurrency(current),
      priceAmount: current,
      originalPrice: onSale && original != null ? formatCurrency(original) : null,
    };
  });
}

/**
 * Ảnh SKU hoặc fallback thumb sản phẩm.
 * @param {object} sku
 * @param {object} product
 */
export function getSkuThumb(sku, product) {
  const skuImg = sku.sku_images?.[0];
  if (skuImg) return skuImg;
  return product.product_thumb ?? '';
}

/**
 * Lọc sản phẩm picker voucher — tên, mã SP (product_code) hoặc mã SKU.
 * @param {object} product
 * @param {string} query
 */
export function productMatchesVoucherPickerSearch(product, query) {
  const q = normalizeSearchText(query);
  if (!q) return true;

  const name = normalizeSearchText(product?.product_name);
  if (name.includes(q)) return true;

  const productCode = normalizeSearchText(pickProductCodeFromApi(product));
  if (productCode && productCode.includes(q)) return true;

  for (const sku of product?.product_skus ?? []) {
    const skuCode = normalizeSearchText(pickSkuCodeFromApi(sku));
    if (skuCode && skuCode.includes(q)) return true;
  }

  return false;
}
