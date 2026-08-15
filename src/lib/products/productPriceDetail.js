import { getProductListMeta, pickSkuCodeFromApi } from '@/lib/products/productDisplay';
import { formatCurrency } from '@/lib/shared/utils';

/**
 * Nhãn biến thể từ tier index.
 * @param {object[]} variations
 * @param {number[]} tierIdx
 */
export function getSkuVariantLabel(variations = [], tierIdx = []) {
  const label = (tierIdx ?? [])
    .map((idx, vi) => variations[vi]?.options?.[idx])
    .filter(Boolean)
    .join(' / ');
  return label || 'Mặc định';
}

/**
 * @param {number} base
 * @param {number} final
 */
export function calcDiscountPercent(base, final) {
  if (base <= 0 || final >= base) return 0;
  return Math.round((1 - final / base) * 100);
}

/**
 * Giá theo từng SKU.
 * @param {object} sku
 * @param {object} product
 */
function resolveSkuPriceRow(sku, product) {
  const variations = product.product_variations ?? [];
  const tierIdx = sku.sku_tier_idx ?? [];
  const basePrice = Number(sku.sku_price) || 0;
  const storedSale = Number(sku.sku_price_sale);
  const hadManualSale = storedSale > 0 && storedSale < basePrice;
  const sellingPrice = hadManualSale ? storedSale : basePrice;
  const finalPrice = sku.sku_price_final != null
    ? Number(sku.sku_price_final)
    : sellingPrice;

  return {
    id: String(sku._id ?? ''),
    label: getSkuVariantLabel(variations, tierIdx),
    skuCode: pickSkuCodeFromApi(sku) ?? '—',
    basePrice,
    finalPrice,
    discountPercent: calcDiscountPercent(basePrice, finalPrice),
  };
}

/**
 * Dữ liệu popover giá — chỉ SKU + voucher hệ thống.
 * @param {object} product
 */
export function buildProductPriceDetail(product) {
  const meta = getProductListMeta(product);
  const active = meta.activeVoucher;
  const hasVoucher = Boolean(product.has_voucher_discount && active);

  const skuRows = (product.product_skus ?? [])
    .map((sku) => resolveSkuPriceRow(sku, product))
    .sort((a, b) => a.finalPrice - b.finalPrice);

  let voucherDiscountPercent = 0;
  if (hasVoucher && active?.type === 'percentage' && active.value > 0) {
    voucherDiscountPercent = Math.round(Number(active.value));
  } else if (hasVoucher && meta.pricePreVoucher > meta.price) {
    voucherDiscountPercent = calcDiscountPercent(meta.pricePreVoucher, meta.price);
  }

  return {
    productName: product.product_name ?? '—',
    hasVoucher,
    voucher: hasVoucher
      ? {
        code: active?.code ?? meta.voucherCode ?? '—',
        discountPercent: voucherDiscountPercent,
      }
      : null,
    skuRows,
  };
}
