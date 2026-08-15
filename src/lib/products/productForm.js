import { pickProductCodeFromApi } from '@/lib/products/productDisplay';
import {
  buildSkuCodeFromVariations,
  ensureUniqueSkuCode,
  generateProductCode,
  slugifyCode,
} from '@/lib/products/sku';
import { resolveProductThumb } from '@/lib/products/productImages';
import { eligibleVoucherToProductVoucher, resolveProductFormVoucherCode } from '@/lib/products/productVoucherPicker';
import {
  buildProductInfoAttributesPayload,
  mapProductInfoAttributesToForm,
  mergeProductInfoAttributesForSave,
  PRODUCT_INFO_FORM_DEFAULTS,
} from '@/lib/products/productInfoAttributes';
import {
  ensureVariationDisplayModes,
  getDefaultVariationDisplayMode,
  normalizeDisplayModeValue,
} from '@/lib/products/variationDisplay';

/** Loại badge chuẩn — `custom` = nhập nội dung thủ công */
export const PRODUCT_BADGE_TYPE_OPTIONS = [
  { value: 'new', label: 'Mới về' },
  { value: 'hot', label: 'Bán chạy' },
  { value: 'sale', label: 'Đang giảm giá' },
  { value: 'custom', label: 'Khác' },
];

const KNOWN_BADGE_TYPES = new Set(
  PRODUCT_BADGE_TYPE_OPTIONS.filter((o) => o.value !== 'custom').map((o) => o.value),
);

/**
 * @param {string} badgeType
 */
export function getProductBadgeTypeLabel(badgeType) {
  return PRODUCT_BADGE_TYPE_OPTIONS.find((o) => o.value === badgeType)?.label ?? '';
}

/**
 * Chuẩn hóa product_category_id từ API (ObjectId, string, hoặc object populate).
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeProductCategoryId(raw) {
  if (raw == null || raw === '') return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'object' && raw !== null) {
    if ('_id' in raw && raw._id != null) return String(raw._id);
    if ('$oid' in raw) return String(raw.$oid);
    if (typeof raw.toString === 'function') {
      const text = raw.toString();
      if (/^[a-f0-9]{24}$/i.test(text)) return text;
    }
  }
  const text = String(raw);
  return text === '[object Object]' ? '' : text;
}

/**
 * Map product API → state form sửa.
 * @param {object} product
 */
export function mapProductToFormState(product) {
  const attrs = product.product_attributes ?? {};
  const badge = product.product_badge ?? {};

  return {
    productCode: pickProductCodeFromApi(product) ?? '',
    thumbUrl: product.product_thumb ?? '',
    variations: ensureVariationDisplayModes(
      (product.product_variations ?? []).map((v, i, arr) => ({
        name: v.name ?? '',
        options: [...(v.options ?? [])],
        colors: [...(v.colors ?? [])],
        display_mode: normalizeDisplayModeValue(
          v.display_mode ?? getDefaultVariationDisplayMode(i, arr.length),
        ),
      })),
    ),
    skus: (product.product_skus ?? []).map((sku) => ({
      sku_code: sku.sku_code ?? '',
      sku_tier_idx: (sku.sku_tier_idx ?? []).map(Number),
      sku_price: sku.sku_price ?? 0,
      sku_price_sale: sku.sku_price_sale ?? sku.sku_price ?? 0,
      sku_stock: sku.sku_stock ?? 0,
      is_default: Boolean(sku.is_default),
      sku_images: [...(sku.sku_images ?? [])],
      sku_videos: [...(sku.sku_videos ?? [])],
      sku_recipe: [...(sku.sku_recipe ?? [])],
      sku_volume: sku.sku_volume ?? sku.sku_recipe_volume ?? undefined,
    })),
    formDefaults: {
      product_name: product.product_name ?? '',
      product_type: product.product_type === 'combo' ? 'dryseed' : (product.product_type ?? 'dryseed'),
      product_category_id: normalizeProductCategoryId(product.product_category_id),
      product_price: product.product_price ?? '',
      product_descriptions: product.product_descriptions ?? '',
      ...mapProductInfoAttributesToForm(attrs),
      badge_type:
        badge.badge_type && badge.badge_type !== 'none'
          ? (KNOWN_BADGE_TYPES.has(badge.badge_type) ? badge.badge_type : 'custom')
          : '',
      badge_text: badge.text ?? '',
      voucher_code: resolveProductFormVoucherCode(product),
    },
  };
}

export const CREATE_FORM_DEFAULTS = {
  product_name: '',
  product_type: 'dryseed',
  product_category_id: '',
  product_price: '',
  product_descriptions: '',
  ...PRODUCT_INFO_FORM_DEFAULTS,
  badge_type: '',
  badge_text: '',
  voucher_code: '',
};

/**
 * @param {object[]} variations
 * @param {object[]} skus
 * @param {string} productCode — mã định danh SP (không phải tên)
 * @param {number|string} basePrice
 */
export function prepareSkusForSubmit(variations, skus, productCode, basePrice) {
  const valid = variations.filter(
    (v) => v.name?.trim() && v.options?.filter(Boolean).length > 0,
  );
  const usedCodes = [];

  return skus.map((sku, i) => {
    const price = Number(sku.sku_price) || Number(basePrice) || 0;
    const sale = Number(sku.sku_price_sale) || price;
    const autoCode = buildSkuCodeFromVariations(valid, sku.sku_tier_idx, productCode) || `SKU-${i + 1}`;
    const baseCode = sku.sku_code?.trim() || autoCode;
    const skuCode = ensureUniqueSkuCode(usedCodes, baseCode);

    const row = {
      sku_code: skuCode,
      sku_tier_idx: sku.sku_tier_idx ?? [],
      sku_price: price,
      sku_price_sale: sale,
      sku_stock: Number(sku.sku_stock) || 0,
      is_default: Boolean(sku.is_default),
      sku_images: sku.sku_images ?? [],
      sku_videos: sku.sku_videos ?? [],
      sku_recipe: sku.sku_recipe ?? [],
      ...(sku.sku_volume ? { sku_volume: Number(sku.sku_volume) } : {}),
    };

    usedCodes.push(skuCode);
    return row;
  });
}

/**
 * Cập nhật thứ tự / danh sách ảnh SKU theo `sku_tier_idx`.
 * @param {object[]} skus
 * @param {number[]} tierIdx
 * @param {string[]} images
 * @returns {object[]}
 */
export function updateSkuImagesForTier(skus, tierIdx, images) {
  return skus.map((sku) => {
    const tier = sku.sku_tier_idx ?? [];
    if (tier.length !== tierIdx.length) return sku;
    if (!tier.every((v, i) => v === tierIdx[i])) return sku;
    return { ...sku, sku_images: [...images] };
  });
}

/**
 * Kiểm tra recipe SKU — bắt buộc ≥1 nguyên liệu + định lượng > 0.
 * @param {Array<{ ingredient_id?: string, weight_needed?: number }>} [recipe]
 * @returns {string | null}
 */
export function validateSkuRecipe(recipe = []) {
  if (!recipe?.length) return 'Cần ít nhất một nguyên liệu';
  for (const row of recipe) {
    if (!row.ingredient_id?.trim()) return 'Chọn nguyên liệu';
    if (!Number(row.weight_needed) || Number(row.weight_needed) <= 0) {
      return 'Nhập định lượng (gram) lớn hơn 0';
    }
  }
  return null;
}

/**
 * Cartesian product variations → SKU rows.
 * @param {object[]} variations
 * @param {object[]} existingSkus
 * @param {string} productCode
 * @param {{ preserveSkuCodes?: boolean }} [opts]
 */
export function generateSkus(variations, existingSkus = [], productCode = '', opts = {}) {
  const { preserveSkuCodes = false } = opts;
  const valid = variations.filter(
    (v) => v.name?.trim() && v.options?.filter(Boolean).length > 0,
  );
  if (!valid.length) return [];

  let combos = [[]];
  for (const v of valid) {
    const optsList = v.options.filter(Boolean);
    combos = combos.flatMap((combo) => optsList.map((_, i) => [...combo, i]));
  }

  return combos.map((tierIdx, i) => {
    const existing = existingSkus.find(
      (s) => JSON.stringify(s.sku_tier_idx) === JSON.stringify(tierIdx),
    );

    const autoCode = buildSkuCodeFromVariations(valid, tierIdx, productCode);

    if (existing) {
      return {
        ...existing,
        sku_code: preserveSkuCodes && existing.sku_code
          ? existing.sku_code
          : (autoCode || existing.sku_code),
      };
    }

    return {
      sku_code: autoCode,
      sku_tier_idx: tierIdx,
      sku_price: 0,
      sku_price_sale: 0,
      sku_stock: 0,
      is_default: i === 0,
      sku_images: [],
      sku_videos: [],
      sku_recipe: [],
    };
  });
}

/**
 * Giá SKU nhỏ nhất (> 0). Dùng làm product_price (sort admin, fallback API).
 * @param {object[]} skus
 * @param {number} [fallback=0]
 * @returns {number}
 */
export function resolveMinSkuPrice(skus = [], fallback = 0) {
  const prices = skus
    .map((s) => Number(s.sku_price))
    .filter((p) => p > 0);

  if (!prices.length) return Number(fallback) || 0;
  return Math.min(...prices);
}

/**
 * Build payload gửi API create/update.
 * @param {object} params
 */
export function buildProductPayload({
  values,
  thumbUrl,
  shopId,
  variations,
  skus,
  productCode,
  eligibleVouchers = [],
  existingProductAttributes = null,
}) {
  const validVariations = variations.filter((v) => v.name?.trim() && v.options?.length);
  const code = slugifyCode(productCode?.trim() || generateProductCode()).slice(0, 16)
    || generateProductCode();

  const baseForEmptySkus = resolveMinSkuPrice(skus) || Number(values.product_price) || 0;
  const preparedSkus = prepareSkusForSubmit(
    variations,
    skus,
    code,
    baseForEmptySkus,
  );
  const product_price = resolveMinSkuPrice(preparedSkus, baseForEmptySkus);

  return {
    product_name: values.product_name,
    product_type: values.product_type,
    product_category_id: values.product_category_id?.trim() || null,
    product_code: code,
    product_price,
    product_descriptions: values.product_descriptions,
    product_thumb: resolveProductThumb(thumbUrl, skus),
    product_shop: shopId,
    product_attributes: mergeProductInfoAttributesForSave(
      buildProductInfoAttributesPayload(values),
      existingProductAttributes ?? {},
    ),
    ...(values.badge_type
      ? { product_badge: { badge_type: values.badge_type, text: values.badge_text ?? '' } }
      : { product_badge: { badge_type: 'none', text: '' } }),
    product_voucher: eligibleVoucherToProductVoucher(
      eligibleVouchers.find(
        (v) => v.code?.toUpperCase() === values.voucher_code?.trim().toUpperCase(),
      ),
    ),
    product_variations: validVariations.map((v) => ({
      name: v.name,
      options: v.options,
      ...(v.colors?.length ? { colors: v.colors } : {}),
      ...(validVariations.length > 1 && v.display_mode
        ? { display_mode: v.display_mode }
        : {}),
    })),
    product_skus: preparedSkus,
  };
}

const COMPARE_SHOP_ID = '__product-form-compare__';

/**
 * Snapshot JSON để so sánh form sửa có thay đổi hay chưa.
 * Dùng cùng pipeline `buildProductPayload` để tránh lệch normalize.
 *
 * @param {{
 *   values: object,
 *   thumbUrl: string,
 *   variations: object[],
 *   skus: object[],
 *   productCode: string,
 *   eligibleVouchers?: object[],
 * }} params
 */
export function serializeProductFormDraftSnapshot({
  values,
  thumbUrl,
  variations,
  skus,
  productCode,
  eligibleVouchers = [],
}) {
  const payload = buildProductPayload({
    values: {
      product_name: values.product_name ?? '',
      product_type: values.product_type ?? 'dryseed',
      product_category_id: values.product_category_id ?? '',
      product_price: values.product_price ?? '',
      product_descriptions: values.product_descriptions ?? '',
      ...Object.fromEntries(
        Object.keys(PRODUCT_INFO_FORM_DEFAULTS).map((key) => [key, values[key] ?? '']),
      ),
      badge_type: values.badge_type ?? '',
      badge_text: values.badge_text ?? '',
      voucher_code: values.voucher_code ?? '',
    },
    thumbUrl,
    shopId: COMPARE_SHOP_ID,
    variations,
    skus,
    productCode,
    eligibleVouchers,
  });

  return JSON.stringify(payload);
}
