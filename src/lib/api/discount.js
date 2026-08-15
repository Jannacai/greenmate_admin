/**
 * Discount / Voucher API — module RBAC: discount.
 *
 * Base path: /discount
 *
 * PUBLIC (chỉ x-api-key):
 *   GET  /discount/discount?code=&shopid=  — sản phẩm áp dụng voucher
 *   POST /discount/amout                   — tính tiền sau giảm
 *   POST /discount/cancel                  — gỡ voucher khỏi user
 *
 * AUTH + grantAccess:
 *   GET   /discount              — danh sách voucher shop (?status, ?search, ?sort, ?applies_to)
 *   GET   /discount/stats        — thống kê lifecycle (Redis TTL ngắn, invalidate khi CRUD)
 *   GET   /discount/eligible-for-product — voucher toàn shop cho picker form SP (admin)
 *   GET   /discount/expiring-soon — voucher đang chạy, sắp hết hạn (không cache)
 *   GET   /discount/expired-alert  — voucher đã hết hạn (không cache)
 *   GET   /discount/:id/scope-products — SP/SKU thuộc phạm vi voucher (admin)
 *   POST  /discount/create        — tạo mới
 *   POST  /discount/publish/:id   — kích hoạt voucher
 *   POST  /discount/unpublish/:id — tắt voucher
 *   PATCH /discount/update/:id    — cập nhật
 *   POST  /discount/delete        — xóa (body/query: code)
 */

import { apiGet, apiPost, apiPatch } from '@/lib/api/client';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

/**
 * @param {Record<string, any>} params
 */
function buildQuery(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      p.set(k, String(v));
    }
  }
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

function parseList(raw) {
  const meta = raw?.metadata ?? raw;
  if (meta?.items && Array.isArray(meta.items)) {
    return {
      items: meta.items,
      total: meta.total ?? meta.items.length,
      page: meta.page ?? 1,
      limit: meta.limit ?? DEFAULT_LIST_LIMIT,
      hasMore: meta.hasMore ?? false,
    };
  }
  if (Array.isArray(meta)) {
    return { items: meta, total: meta.length, page: 1, limit: meta.length, hasMore: false };
  }
  return { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT, hasMore: false };
}

/**
 * Danh sách voucher của shop.
 * @param {{ page?: number, limit?: number, status?: string, search?: string, sort?: string, applies_to?: string }} [params]
 */
export async function getDiscounts(params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    status: params.status,
    search: params.search,
    sort: params.sort ?? 'ctime',
    applies_to: params.applies_to,
  });

  const raw = await apiGet(`/discount${query}`, {
    revalidate: 0,
    tags: ['discounts'],
  });

  return parseList(raw);
}

/**
 * Voucher đang chạy và sắp hết hạn — banner nhắc admin.
 * @param {{ within_hours?: number, limit?: number }} [params]
 */
export async function getDiscountsExpiringSoon(params = {}) {
  const query = buildQuery({
    within_hours: params.within_hours,
    limit: params.limit,
  });

  const raw = await apiGet(`/discount/expiring-soon${query}`, {
    revalidate: 0,
    tags: ['discounts', 'discount-expiring-soon'],
  });

  const meta = raw?.metadata ?? raw;
  return {
    items: Array.isArray(meta?.items) ? meta.items : [],
    within_hours: meta?.within_hours ?? params.within_hours ?? 48,
  };
}

/**
 * Voucher đã hết hạn — banner đỏ nhắc admin.
 * @param {{ limit?: number }} [params]
 */
export async function getDiscountsExpiredAlert(params = {}) {
  const query = buildQuery({
    limit: params.limit,
  });

  const raw = await apiGet(`/discount/expired-alert${query}`, {
    revalidate: 0,
    tags: ['discounts', 'discount-expired-alert'],
  });

  const meta = raw?.metadata ?? raw;
  return {
    items: Array.isArray(meta?.items) ? meta.items : [],
    total: meta?.total ?? 0,
  };
}

/**
 * Voucher toàn shop đang active — picker form sản phẩm (admin API, không dùng public).
 * @returns {Promise<ReturnType<typeof import('@/lib/products/productVoucherPicker').serializeEligibleVoucherForPicker>[]>}
 */
export async function getEligibleProductVouchersForPicker() {
  const raw = await apiGet('/discount/eligible-for-product', {
    revalidate: 0,
    tags: ['discounts', 'discount-eligible-product'],
  });

  const meta = raw?.metadata ?? raw;
  const items = Array.isArray(meta?.items) ? meta.items : [];
  return items;
}

/**
 * SP đã có voucher hẹp — chặn chọn trùng trên form voucher.
 * @param {{ excludeDiscountId?: string }} [params]
 */
export async function getNarrowVoucherProductLocks(params = {}) {
  const query = buildQuery({
    exclude_discount_id: params.excludeDiscountId,
  });

  const raw = await apiGet(`/discount/narrow-product-locks${query}`, {
    revalidate: 0,
    tags: ['discounts', 'discount-narrow-locks'],
  });

  const meta = raw?.metadata ?? raw;
  return {
    product_ids: meta?.product_ids ?? [],
    by_product: meta?.by_product ?? {},
  };
}

/**
 * Thống kê số lượng voucher theo lifecycle — tab admin (backend cache Redis ngắn).
 * @param {{ applies_to?: string }} [params]
 */
export async function getDiscountStats(params = {}) {
  const query = buildQuery({
    applies_to: params.applies_to,
  });

  const raw = await apiGet(`/discount/stats${query}`, {
    revalidate: 0,
    tags: ['discounts', 'discount-stats'],
  });

  const meta = raw?.metadata ?? raw;
  return {
    all: meta?.all ?? 0,
    active: meta?.active ?? 0,
    scheduled: meta?.scheduled ?? 0,
    expired: meta?.expired ?? 0,
    inactive: meta?.inactive ?? 0,
  };
}

/** @param {string} discountId */
export async function getDiscountById(discountId) {
  const raw = await apiGet(`/discount/${discountId}`, {
    tags: [`discount-${discountId}`],
    revalidate: 0,
  });
  return raw?.metadata ?? raw;
}

/**
 * Sản phẩm / SKU thuộc phạm vi voucher (admin — gồm draft).
 * @param {string} discountId
 * @param {{ page?: number, limit?: number, search?: string }} [params]
 */
export async function getDiscountScopeProducts(discountId, params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
  });

  const raw = await apiGet(`/discount/${discountId}/scope-products${query}`, {
    tags: ['discount-scope', `discount-scope-${discountId}`, `discount-${discountId}`],
    revalidate: 0,
  });
  return raw?.metadata ?? raw;
}

/**
 * Sản phẩm áp dụng voucher (public endpoint).
 * @param {{ code: string, shopId: string, page?: number, limit?: number }} params
 */
export async function getDiscountProducts({ code, shopId, page = 1, limit = 20 }) {
  const query = buildQuery({
    code,
    shopid: shopId,
    page,
    limit,
  });

  const raw = await apiGet(`/discount/discount${query}`, { revalidate: 0 });
  const meta = raw?.metadata ?? raw;
  const inner = meta?.data ?? meta;

  if (Array.isArray(inner)) {
    return { items: inner, total: inner.length, page, limit };
  }
  return parseList(raw);
}

/** @param {object} body */
export async function createDiscount(body) {
  return apiPost('/discount/create', body);
}

/**
 * @param {string} discountId
 * @param {object} body
 */
export async function updateDiscount(discountId, body) {
  return apiPatch(`/discount/update/${discountId}`, body);
}

/** @param {string} code */
export async function deleteDiscount(code) {
  return apiPost('/discount/delete', { code });
}

/** @param {string} discountId */
export async function publishDiscount(discountId) {
  return apiPost(`/discount/publish/${discountId}`, {});
}

/** @param {string} discountId */
export async function unpublishDiscount(discountId) {
  return apiPost(`/discount/unpublish/${discountId}`, {});
}

/**
 * Thẩm định + tính tiền giảm (public).
 * @param {object} body
 */
export async function calculateDiscountAmount(body) {
  const raw = await apiPost('/discount/amout', body);
  return raw?.metadata ?? raw;
}

/**
 * Gỡ user khỏi danh sách đã dùng voucher (public/admin tool).
 * @param {{ code: string, shopId: string, userId: string }} params
 */
export async function cancelUserDiscount({ code, shopId, userId }) {
  const raw = await apiPost('/discount/cancel', { code, shopId, userId });
  return raw?.metadata ?? raw;
}
