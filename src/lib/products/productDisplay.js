import { getProductBadgeTypeLabel } from '@/lib/products/productForm';
import { PRODUCT_TYPE_LABELS } from '@/lib/products/productListFilter';
import { formatCurrency, stringifyMongoId } from '@/lib/shared/utils';

/** @type {Record<string, { label: string, className: string }>} */
export const PRODUCT_TYPE_BADGE = {
  dryseed: {
    label: 'Hạt khô',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
    tableTextClass: 'text-amber-800',
  },
  milkseed: {
    label: 'Sữa hạt',
    className: 'bg-sky-50 text-sky-800 ring-sky-200',
    tableTextClass: 'text-sky-800',
  },
  combo: {
    label: 'Combo',
    className: 'bg-violet-50 text-violet-800 ring-violet-200',
    tableTextClass: 'text-violet-800',
  },
};

/**
 * Mã SP từ payload API — không sinh phía client.
 * @param {object} [product]
 * @returns {string | null}
 */
export function pickProductCodeFromApi(product) {
  const code = product?.product_code?.trim()
    || product?.product_attributes?.product_code?.trim();
  return code || null;
}

/**
 * Mã voucher đang áp dụng vào giá SP (từ API `active_voucher`).
 * @param {object} [product]
 * @returns {string | null}
 */
export function pickAppliedVoucherCodeFromApi(product) {
  const code = product?.active_voucher?.code?.trim();
  if (product?.has_voucher_discount && code) {
    return code;
  }
  return null;
}

/**
 * Id voucher đang áp dụng vào giá SP (từ API `active_voucher.id`).
 * @param {object} [product]
 * @returns {string | null}
 */
export function pickAppliedVoucherIdFromApi(product) {
  if (!pickAppliedVoucherCodeFromApi(product)) return null;
  const id = product?.active_voucher?.id ?? product?.active_voucher?._id;
  return stringifyMongoId(id) || null;
}

/**
 * Strip voucher trên ProductCard preview — chỉ khi voucher hệ thống đang tính vào giá.
 * Pill hiển thị tiêu đề (`text` / `discount_name`), không dùng mô tả dài.
 * @param {object} [product]
 * @returns {{ code: string, text?: string, desc?: string } | null}
 */
export function resolvePreviewVoucherStripFromApi(product) {
  const code = pickAppliedVoucherCodeFromApi(product);
  if (!code) return null;

  const active = product.active_voucher ?? {};
  const promo = product.product_voucher ?? {};
  const promoMatchesApplied = promo.code?.trim().toUpperCase() === code.toUpperCase();

  const text = active.name?.trim()
    || active.description?.trim()
    || (promoMatchesApplied && promo.text?.trim())
    || null;

  return {
    code,
    text: text || undefined,
    desc: promo.desc?.trim() || undefined,
  };
}

/**
 * Mã SKU từ payload API — không sinh phía client.
 * @param {object} [sku]
 * @returns {string | null}
 */
export function pickSkuCodeFromApi(sku) {
  return sku?.sku_code?.trim() || null;
}

/**
 * Meta hiển thị trên dòng danh sách admin.
 * @param {object} product
 */
export function getProductListMeta(product) {
  const id = stringifyMongoId(product._id);
  const status = product._listStatus ?? 'draft';
  const typeKey = product.product_type ?? '';
  const typeBadge = PRODUCT_TYPE_BADGE[typeKey] ?? {
    label: PRODUCT_TYPE_LABELS[typeKey] ?? typeKey ?? '—',
    className: 'bg-gray-50 text-gray-600 ring-gray-200',
    tableTextClass: 'text-gray-600',
  };
  const productCode = pickProductCodeFromApi(product);
  const skuCount = product.sku_count ?? (Array.isArray(product.product_skus) ? product.product_skus.length : null);
  const variationCount = Array.isArray(product.product_variations)
    ? product.product_variations.length
    : null;

  const priceBase = Number(product.product_price_base_min ?? product.product_price ?? 0);
  const pricePreVoucher = Number(
    product.product_price_pre_voucher_min ?? priceBase,
  );
  const priceSale = Number(product.product_price_min ?? pricePreVoucher);
  const priceMax = Number(product.product_price_max ?? priceSale);
  const activeVoucher = product.active_voucher ?? null;
  const promoVoucher = product.product_voucher ?? null;

  /** Voucher thực sự đã tính vào giá (has_voucher_discount từ API) */
  const hasActiveVoucher = Boolean(product.has_voucher_discount && activeVoucher);

  /** Giá min khách thấy thấp hơn giá gốc min — dùng cho màu badge & nhãn */
  const hasVisiblePriceDrop = priceBase > 0 && priceSale > 0 && priceSale < priceBase;

  /**
   * SKU có giá KM — chỉ coi là "đang giảm" trên danh sách khi giá min hiển thị
   * thực sự thấp hơn giá gốc min (tránh tô vàng khi biến thể khác vẫn full giá).
   */
  const hasSkuManualSale = !hasActiveVoucher && hasVisiblePriceDrop;

  const showPriceDrop = hasActiveVoucher || hasSkuManualSale;
  const discountSource = hasActiveVoucher ? 'voucher' : hasSkuManualSale ? 'sku_sale' : null;

  /** Voucher %: ưu tiên cấu hình voucher; SKU sale: tính từ giá gốc → giá bán */
  let discountPercent = 0;
  if (hasActiveVoucher) {
    if (activeVoucher?.type === 'percentage' && activeVoucher?.value > 0) {
      discountPercent = Math.round(Number(activeVoucher.value));
    } else if (pricePreVoucher > priceSale) {
      discountPercent = Math.round((1 - priceSale / pricePreVoucher) * 100);
    }
  } else if (hasSkuManualSale && priceBase > priceSale) {
    discountPercent = Math.round((1 - priceSale / priceBase) * 100);
  }

  /** Chỉ hiện mã voucher khi voucher hệ thống đang áp dụng vào giá */
  const voucherCode = hasActiveVoucher ? activeVoucher?.code ?? null : null;
  const voucherName = hasActiveVoucher ? activeVoucher?.name ?? null : null;

  /** Nhãn marketing — chỉ khi trùng mã voucher đang áp dụng vào giá */
  const promoMatchesActive = promoVoucher?.code?.trim().toUpperCase()
    === activeVoucher?.code?.trim().toUpperCase();
  const promoLabel = hasActiveVoucher && promoMatchesActive && (promoVoucher?.code || promoVoucher?.text)
    ? (promoVoucher.code ?? promoVoucher.text)
    : null;

  const rawBadge = product.product_badge ?? null;
  const badgeType = rawBadge?.badge_type;
  const merchBadge =
    badgeType && badgeType !== 'none'
      ? {
        type: badgeType,
        text:
          rawBadge.text?.trim()
          || getProductBadgeTypeLabel(badgeType)
          || badgeType,
      }
      : null;

  const quantitySold = Number(product.product_quantity_sold ?? 0);

  return {
    id,
    status,
    typeBadge,
    productCode,
    skuCount,
    variationCount,
    merchBadge,
    quantitySold,
    price: priceSale,
    priceBase,
    pricePreVoucher,
    priceMax,
    hasDiscount: showPriceDrop,
    discountSource,
    discountPercent,
    activeVoucher,
    promoVoucher,
    voucherCode,
    voucherName,
    promoLabel,
    priceLabel: priceSale > 0 ? formatCurrency(priceSale) : '—',
    basePriceLabel: priceBase > 0 ? formatCurrency(priceBase) : '—',
    hasThumb: Boolean(product.product_thumb),
  };
}

/**
 * Thống kê nhanh trên trang hiện tại (giống countVoucherStatuses).
 * @param {object[]} products
 */
export function countProductsOnPage(products = []) {
  let published = 0;
  let draft = 0;
  /** @type {Record<string, number>} */
  const byType = {};

  for (const product of products) {
    if (product._listStatus === 'published') published += 1;
    else draft += 1;

    const type = product.product_type ?? 'unknown';
    byType[type] = (byType[type] ?? 0) + 1;
  }

  return { published, draft, byType };
}
