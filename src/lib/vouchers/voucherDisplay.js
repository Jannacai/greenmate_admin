import { formatCurrency, stringifyMongoId } from '@/lib/shared/utils';
import { pickProductCodeFromApi, pickSkuCodeFromApi } from '@/lib/products/productDisplay';
import { getVoucherLifecycleStatus } from '@/lib/vouchers/voucherSchema';
import { APPLIES_TO_CONFIG } from '@/lib/vouchers/voucherAppliesToConfig';
import {
  getSkuDisplayPrice,
  getSkuVariantLabel,
  getProductPriceDisplay,
  getProductSkuPriceLines,
} from '@/lib/vouchers/voucherProductPicker';

export { APPLIES_TO_CONFIG };

/**
 * @param {object} discount
 */
export function getVoucherValueLabel(discount) {
  if (discount?.discount_type === 'percentage') {
    return `${discount.discount_value}%`;
  }
  return formatCurrency(discount?.discount_value ?? 0);
}

/**
 * @param {object} discount
 */
export function getVoucherValueHint(discount) {
  if (discount?.discount_type === 'percentage') return 'Giảm theo %';
  return 'Giảm cố định';
}

/**
 * @param {string | AppliesTo | undefined} appliesTo
 */
export function getAppliesToConfig(appliesTo) {
  return APPLIES_TO_CONFIG[appliesTo] ?? {
    label: appliesTo ?? '—',
    shortLabel: appliesTo ?? '—',
    className: 'bg-gray-50 text-gray-600 ring-gray-200',
  };
}

/**
 * @param {object} discount
 */
export function getVoucherUsage(discount) {
  const used = discount?.discount_uses_count ?? 0;
  const max = Math.max(discount?.discount_max_uses ?? 1, 1);
  const percent = Math.min(100, Math.round((used / max) * 100));
  const remaining = Math.max(0, max - used);

  return { used, max, percent, remaining };
}

/**
 * Đếm trạng thái lifecycle trên một mảng voucher.
 * @param {object[]} vouchers
 */
export function countVoucherStatuses(vouchers = []) {
  /** @type {Record<string, number>} */
  const counts = { active: 0, scheduled: 0, expired: 0, inactive: 0 };

  for (const voucher of vouchers) {
    const status = getVoucherLifecycleStatus(voucher);
    counts[status] = (counts[status] ?? 0) + 1;
  }

  return counts;
}

/**
 * Meta quản lý sản phẩm — tên + mã SP (product_code) + _id nội bộ.
 * @param {object} [product]
 */
export function getProductManagementMeta(product) {
  const name = product?.product_name?.trim() || 'Sản phẩm chưa đặt tên';
  const id = stringifyMongoId(product?._id);
  const productCode = pickProductCodeFromApi(product);

  return {
    id,
    productCode,
    name,
    price: getProductPriceDisplay(product ?? {}),
    thumb: product?.product_thumb ?? '',
  };
}

/**
 * Gom SKU theo sản phẩm chính — hiển thị gọn, mở rộng biến thể khi cần.
 * @param {Array<{ product: object, sku: object }>} skuItems
 */
export function groupSkuItemsByProduct(skuItems = []) {
  /** @type {Map<string, { productId: string, productName: string, thumb: string, variants: object[] }>} */
  const map = new Map();

  for (const item of skuItems) {
    const meta = getScopeSkuLabel(item);
    const pid = meta.productId || meta.skuId;
    if (!map.has(pid)) {
      map.set(pid, {
        productId: meta.productId,
        productCode: pickProductCodeFromApi(item.product),
        productName: meta.productName,
        thumb: getProductManagementMeta(item.product).thumb,
        variants: [],
      });
    }
    map.get(pid).variants.push({
      skuId: meta.skuId,
      skuCode: meta.skuCode,
      variantLabel: meta.subtitle,
      price: meta.price,
      priceAmount: meta.priceAmount,
    });
  }

  return [...map.values()].map((group) => ({
    ...group,
    variantCount: group.variants.length,
    priceSummary: summarizeVariantPrices(group.variants),
  }));
}

/** @param {Array<{ price: string }>} variants */
export function summarizeVariantPrices(variants) {
  if (!variants.length) return '—';
  if (variants.length === 1) return variants[0].price;
  return `${variants.length} biến thể`;
}

/**
 * Dòng scope voucher — áp dụng theo sản phẩm (mọi SKU của SP).
 * Cùng shape với groupSkuItemsByProduct để UI render giống mode SKU.
 * @param {object} product
 */
export function buildProductScopeRow(product) {
  const meta = getProductManagementMeta(product);
  const skuPriceLines = getProductSkuPriceLines(product);
  const variants = skuPriceLines.map((line) => ({
    skuId: line.skuId,
    skuCode: line.skuCode,
    variantLabel: line.label,
    price: line.price,
    priceAmount: line.priceAmount ?? 0,
    originalPrice: line.originalPrice ?? null,
  }));

  return {
    key: meta.id,
    productId: meta.id,
    productCode: meta.productCode,
    productName: meta.name,
    thumb: meta.thumb,
    price: summarizeVariantPrices(variants),
    skuPriceLines,
    variantCount: variants.length,
    variants,
    missing: false,
    isDraft: product._scopeProductStatus === 'draft',
    isRemoved: product._scopeRemoved === true || product._scopeProductStatus === 'removed',
  };
}

/**
 * Meta SKU scope voucher — skuId (_id nội bộ) + skuCode (product_code + biến thể).
 * @param {{ product: object, sku: object }} item
 */
export function getScopeSkuLabel(item) {
  const { product, sku } = item;
  const productMeta = getProductManagementMeta(product);
  const variant = getSkuVariantLabel(sku, product.product_variations ?? []);
  const { current } = getSkuDisplayPrice(sku);

  return {
    productId: productMeta.id,
    productName: productMeta.name,
    skuId: stringifyMongoId(sku._id),
    skuCode: pickSkuCodeFromApi(sku),
    subtitle: variant,
    price: formatCurrency(current),
    priceAmount: current,
    thumb: sku.sku_images?.[0] ?? productMeta.thumb,
  };
}

/**
 * Tóm tắt điều kiện voucher — dùng trên hero/detail.
 * @param {object} discount
 * @param {ReturnType<import('@/lib/vouchers/voucherScopeFromApi').mapDiscountScopeApiToDisplay>} scope
 */
export function getVoucherConditionSummary(discount, scope) {
  const minOrder = scope?.minOrder ?? 0;
  const minOrderText =
    minOrder > 0
      ? `Đơn hàng tối thiểu ${formatCurrency(minOrder)}`
      : 'Không yêu cầu đơn tối thiểu';

  const scopeText = scope?.isAllShop
    ? 'Áp dụng toàn shop'
    : discount
      ? getVoucherScopeShortLabelFromDiscount(discount)
      : (scope?.summary ?? '—');

  return { minOrderText, scopeText, minOrder };
}

/**
 * Đếm số sản phẩm trong phạm vi voucher (specific hoặc legacy specific_sku).
 * @param {object} discount
 * @returns {number}
 */
export function resolveVoucherScopeProductCount(discount) {
  const appliesTo = discount?.discount_applies_to ?? 'all';
  if (appliesTo === 'all') return 0;

  const productIds = discount?.discount_product_ids ?? [];
  if (appliesTo === 'specific' && productIds.length) {
    return productIds.length;
  }

  const scopeProducts = discount?.discount_scope_labels?.products ?? [];
  if (scopeProducts.length) {
    return scopeProducts.length;
  }

  const scopeSkus = discount?.discount_scope_labels?.skus ?? [];
  if (scopeSkus.length) {
    const unique = new Set(
      scopeSkus.map((row) => String(row.product_id ?? '').trim()).filter(Boolean),
    );
    if (unique.size) return unique.size;
  }

  if (appliesTo === 'specific') {
    return productIds.length;
  }

  return 0;
}

/**
 * Nhãn phạm vi từ object discount (danh sách — không cần scope API).
 * @param {object} discount
 */
export function getVoucherScopeLabelFromDiscount(discount) {
  const appliesTo = discount?.discount_applies_to ?? 'all';
  if (appliesTo === 'all') return 'Toàn shop';

  const productCount = resolveVoucherScopeProductCount(discount);

  if (appliesTo === 'specific' || appliesTo === 'specific_sku') {
    return productCount > 0
      ? `${productCount} sản phẩm áp dụng cho voucher này`
      : 'Sản phẩm cụ thể';
  }

  return '—';
}

/**
 * Nhãn phạm vi rút gọn — dùng cột bảng danh sách voucher.
 * @param {object} discount
 */
export function getVoucherScopeShortLabelFromDiscount(discount) {
  const appliesTo = discount?.discount_applies_to ?? 'all';
  if (appliesTo === 'all') return 'Toàn shop';

  const productCount = resolveVoucherScopeProductCount(discount);

  if (appliesTo === 'specific' || appliesTo === 'specific_sku') {
    return productCount > 0
      ? `${productCount} sản phẩm`
      : 'Sản phẩm cụ thể';
  }

  return '—';
}

/**
 * @param {object} discount
 * @returns {'default' | 'violet'}
 */
export function getVoucherScopeValueTone(discount) {
  return discount?.discount_applies_to === 'all' ? 'default' : 'violet';
}

export { applyVoucherToSkuPrice } from '@/lib/vouchers/voucherPricePreview';
export { getProductPriceDisplay };
