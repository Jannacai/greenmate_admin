import { stringifyMongoId } from '@/lib/shared/utils';
import { pickProductCodeFromApi } from '@/lib/products/productDisplay';

/**
 * Gắn _scopeProductStatus từ list_status API.
 * @param {object} product
 */
function tagScopeProductStatus(product) {
  if (!product || typeof product !== 'object') return product;
  if (product._scopeRemoved) {
    product._scopeProductStatus = 'removed';
  } else if (product.list_status === 'draft' || product._listStatus === 'draft') {
    product._scopeProductStatus = 'draft';
  }
  return product;
}

/**
 * @param {object} [product]
 * @returns {'published' | 'draft'}
 */
function resolveListStatus(product) {
  if (!product) return 'published';
  if (product._scopeRemoved || product._scopeProductStatus === 'removed') return 'removed';
  if (product.list_status === 'draft' || product._scopeProductStatus === 'draft') return 'draft';
  if (product.list_status === 'published') return 'published';
  if (product.isPublished === false) return 'draft';
  return 'published';
}

/**
 * Map response GET /discount/:id/scope-products → shape VoucherScopeItemList.
 *
 * @param {object} api
 */
export function mapDiscountScopeApiToDisplay(api) {
  const appliesTo = api?.applies_to ?? 'all';
  const minOrder = Number(api?.min_order ?? 0);
  const missing = api?.missing ?? {};

  const productItems = (api?.product_items ?? []).map((p) => tagScopeProductStatus({ ...p }));
  const skuItems = (api?.sku_items ?? []).map(({ product, sku }) => ({
    product: tagScopeProductStatus({ ...product }),
    sku,
  }));

  return {
    appliesTo,
    minOrder,
    isAllShop: Boolean(api?.is_all_shop),
    summary: api?.summary ?? '—',
    productItems,
    skuItems,
    missingProductIds: (missing.product_ids ?? []).map(stringifyMongoId).filter(Boolean),
    missingSkuIds: (missing.sku_ids ?? []).map(stringifyMongoId).filter(Boolean),
    targetCount: api?.target_count ?? null,
    page: api?.page ?? 1,
    limit: api?.limit ?? 10,
    total:
      api?.total ??
      (appliesTo === 'specific'
        ? (api?.target_count ?? productItems.length)
        : appliesTo === 'specific_sku'
          ? productItems.length
          : 0),
    hasMore: Boolean(api?.has_more),
  };
}

/**
 * Gom sản phẩm unique từ scope API — dùng hover popover.
 * @param {object} api
 */
export function mapDiscountScopeApiToRows(api) {
  const appliesTo = api?.applies_to ?? 'all';

  if (appliesTo === 'all') {
    return {
      items: [],
      isAllShop: true,
      appliesTo,
      missingCount: 0,
    };
  }

  if (appliesTo === 'specific') {
    const items = (api?.product_items ?? []).map((p) => ({
      id: stringifyMongoId(p._id),
      name: p.product_name?.trim() || 'Sản phẩm chưa đặt tên',
      thumb: p.product_thumb ?? '',
      productCode: pickProductCodeFromApi(p),
      status: resolveListStatus(p),
    }));

    const missingCount = api?.missing?.product_ids?.length ?? 0;
    return { items, isAllShop: false, appliesTo, missingCount };
  }

  if (appliesTo === 'specific_sku') {
    const seen = new Set();
    /** @type {object[]} */
    const items = [];

    for (const { product } of api?.sku_items ?? []) {
      const id = stringifyMongoId(product?._id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      items.push({
        id,
        name: product.product_name?.trim() || 'Sản phẩm chưa đặt tên',
        thumb: product.product_thumb ?? '',
        productCode: pickProductCodeFromApi(product),
        status: resolveListStatus(product),
      });
    }

    const missingCount = api?.missing?.sku_ids?.length ?? 0;
    return { items, isAllShop: false, appliesTo, missingCount };
  }

  return { items: [], isAllShop: false, appliesTo, missingCount: 0 };
}
