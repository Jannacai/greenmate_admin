/**
 * Product API — tất cả API calls liên quan đến sản phẩm.
 *
 * Base path: /product
 *
 * PUBLIC (chỉ cần x-api-key):
 *   GET  /product/search/:keySearch   — tìm kiếm
 *   GET  /product                     — danh sách published (public)
 *   GET  /product/:product_id         — chi tiết published (public, có cache)
 *
 * AUTH (cần authorization + x-client-id):
 *   GET  /product/admin/:productId    — chi tiết admin (draft + published, không cache)
 *   GET  /product/shop/list          — danh sách admin (search + voucher query)
 *   GET  /product/publish/all         — danh sách đã published (của shop)
 *   GET  /product/drafts/all          — danh sách draft (của shop)
 *   GET  /product/admin/picker       — picker voucher (search)
 *   POST /product/admin/by-ids       — batch theo _id / sku_ids
 *   POST /product/create              — tạo mới
 *   PATCH /product/:productId         — cập nhật
 *   POST /product/publish/:id         — publish
 *   POST /product/unpublish/:id       — unpublish
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import { normalizeProductForVoucherPicker } from '@/lib/vouchers/voucherProductPicker';

/**
 * Build query string từ object, bỏ qua giá trị undefined/null/rỗng.
 * @param {Record<string, any>} params
 * @returns {string}  VD: "page=1&limit=20&search=hat"
 */
function buildQuery(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      p.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
  }
  return p.toString();
}

/**
 * Normalize response — backend trả { metadata: { data: [...], total, page } }
 * hoặc { metadata: [...] }.
 * @param {any} raw
 * @returns {{ items: any[], total: number, page: number, limit: number }}
 */
export function normalizeListResponse(raw) {
  const outer = raw?.metadata ?? raw;
  const inner = outer?.data    ?? outer;

  if (Array.isArray(inner)) {
    return {
      items: inner,
      total: outer?.total ?? inner.length,
      page:  outer?.page  ?? 1,
      limit: outer?.limit ?? inner.length,
    };
  }

  // Fallback
  return { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };
}

/**
 * Parse response danh sách admin — metadata có items, total, stats.
 * @param {any} raw
 */
function parseAdminProductList(raw) {
  const meta = raw?.metadata ?? raw;

  if (meta?.items && Array.isArray(meta.items)) {
    return {
      items: meta.items,
      total: meta.total ?? meta.items.length,
      page: meta.page ?? 1,
      limit: meta.limit ?? DEFAULT_LIST_LIMIT,
      hasMore: meta.hasMore ?? false,
      stats: meta.stats ?? { total: 0, published: 0, draft: 0 },
    };
  }

  return {
    items: [],
    total: 0,
    page: 1,
    limit: DEFAULT_LIST_LIMIT,
    hasMore: false,
    stats: { total: 0, published: 0, draft: 0 },
  };
}

/**
 * Normalize single product response.
 * @param {any} raw
 * @returns {any}
 */
export function normalizeProductResponse(raw) {
  return raw?.metadata?.data ?? raw?.metadata ?? raw;
}

/**
 * Batch lấy SP theo _id — admin (published + draft).
 * @param {{ ids: string[], includeSkus?: boolean }} params
 */
export async function getProductsByIds({
  ids = [],
  skuIds = [],
  includeSkus = true,
} = {}) {
  const raw = await apiPost('/product/admin/by-ids', {
    ids,
    sku_ids: skuIds,
    includeSkus,
  });
  const meta = raw?.metadata ?? raw;
  const items = (meta?.items ?? []).map(normalizeProductForVoucherPicker);
  return {
    items,
    missingIds: meta?.missing_ids ?? [],
  };
}

/**
 * Picker voucher — tìm kiếm server, payload nhẹ kèm SKU.
 * @param {{ page?: number, limit?: number, search?: string, status?: 'published' | 'draft' | 'all' }} [params]
 */
export async function searchProductsForPicker({
  page = 1,
  limit = 20,
  search = '',
  status = 'published',
} = {}) {
  const q = buildQuery({ page, limit, search: search.trim() || undefined, status });
  const raw = await apiGet(`/product/admin/picker?${q}`, {
    tags: ['products-picker'],
    revalidate: 0,
  });
  const meta = raw?.metadata ?? raw;
  const items = (meta?.items ?? []).map(normalizeProductForVoucherPicker);

  return {
    items,
    total: meta?.total ?? items.length,
    page: meta?.page ?? page,
    limit: meta?.limit ?? limit,
    hasMore: meta?.hasMore ?? false,
  };
}

/* ─────────────────────────────────────────
   PUBLIC — không cần auth (chỉ x-api-key)
───────────────────────────────────────── */

/**
 * Tìm kiếm sản phẩm theo từ khóa.
 * @param {string} keyword
 * @param {{ page?: number, limit?: number }} [opts]
 */
export async function searchProducts(keyword, { page = 1, limit = 20 } = {}) {
  const q   = buildQuery({ page, limit });
  const raw = await apiGet(
    `/product/search/${encodeURIComponent(keyword)}?${q}`,
    { tags: ['products-search'] },
  );
  return normalizeListResponse(raw);
}

/**
 * Lấy tất cả sản phẩm (public listing — không cần đăng nhập).
 * @param {{ page?: number, limit?: number, filter?: object, sort?: object }} [opts]
 */
export async function getAllProducts({ page = 1, limit = 20, filter, sort } = {}) {
  const q   = buildQuery({ page, limit, filter, sort });
  const raw = await apiGet(`/product?${q}`, { revalidate: 0, tags: ['products'] });
  return normalizeListResponse(raw);
}

/* ─────────────────────────────────────────
   AUTH — cần authorization + x-client-id
───────────────────────────────────────── */

/**
 * Chi tiết sản phẩm admin — draft + published, không cache storefront.
 * @param {string} productId
 */
export async function getProductById(productId) {
  const raw = await apiGet(`/product/admin/${productId}`, { revalidate: 0 });
  return normalizeProductResponse(raw);
}

/**
 * Danh sách sản phẩm cho trang admin — phân trang server, giá sau voucher.
 * `search` khớp tên SP, mã SP (`product_code`) hoặc mã SKU (`sku_code`).
 * `voucher` lọc SP đang được áp voucher active (`discount_code`).
 * `voucher_applied` lọc SP có/không có voucher đang áp (`yes` | `no`).
 *
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: string,
 *   type?: string,
 *   search?: string,
 *   voucher?: string,
 *   voucher_applied?: 'yes' | 'no',
 *   sort?: string,
 * }} [params]
 */
export async function getAdminProductList(params = {}) {
  const q = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    status: params.status,
    type: params.type,
    search: params.search,
    voucher: params.voucher,
    voucher_applied: params.voucher_applied,
    sort: params.sort ?? 'updated_desc',
  });

  const raw = await apiGet(`/product/shop/list?${q}`, {
    revalidate: 0,
    tags: ['products-admin-list'],
  });

  return parseAdminProductList(raw);
}

/**
 * Tạo sản phẩm mới.
 *
 * @param {CreateProductPayload} data
 *
 * @typedef {Object} CreateProductPayload
 * @property {string}   product_name
 * @property {string}   product_type          — 'dryseed' | 'milkseed'
 * @property {number}   product_price
 * @property {string}   [product_description]
 * @property {string}   [product_thumb]
 * @property {object}   [product_attributes]  — { brand, origin, ... }
 * @property {object[]} [product_variations]  — [{ name, options: string[] }]
 * @property {object[]} [product_skus]        — [{ sku_tier_idx, sku_price, sku_stock, ... }]
 */
export function createProduct(data) {
  return apiPost('/product/create', data);
}

/**
 * Cập nhật sản phẩm.
 * @param {string} productId
 * @param {Partial<CreateProductPayload>} data
 */
export function updateProduct(productId, data) {
  return apiPatch(`/product/${productId}`, data);
}

/**
 * Publish sản phẩm (draft → published).
 * @param {string} productId
 */
export function publishProduct(productId) {
  return apiPost(`/product/publish/${productId}`, {});
}

/**
 * Unpublish sản phẩm (published → draft).
 * @param {string} productId
 */
export function unpublishProduct(productId) {
  return apiPost(`/product/unpublish/${productId}`, {});
}

/**
 * Xóa sản phẩm khỏi catalog (cần delete:any).
 * @param {string} productId
 */
export function deleteProduct(productId) {
  return apiDelete(`/product/${productId}`);
}

/**
 * Kiểm tra mã SP còn trống trong shop.
 * @param {string} code
 * @param {string} [excludeProductId]
 */
export function checkProductCodeAvailable(code, excludeProductId) {
  const qs = buildQuery({ code, excludeProductId });
  return apiGet(`/product/admin/check-code?${qs}`, { revalidate: 0 });
}
