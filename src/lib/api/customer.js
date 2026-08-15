/**
 * Customer API — quản lý khách hàng (module RBAC: customer).
 *
 * Base path: /user
 *
 * AUTH + grantAccess:
 *   GET   /user/listcustomer/USER     — danh sách (filter, pagination)
 *   GET   /user/customer/:id              — chi tiết
 *   PATCH /user/customer/:id/status       — khóa / mở / duyệt
 *   PATCH /user/customer/:id              — cập nhật hồ sơ
 *   GET   /user/customer/:id/access-logs  — lịch sử đăng nhập
 */

import { apiGet, apiPatch } from '@/lib/api/client';
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
      hasMore: meta.hasMore ?? meta.items.length < (meta.total ?? 0),
    };
  }
  return { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT, hasMore: false };
}

/**
 * Danh sách khách hàng (role_type USER).
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   sort?: string,
 *   status?: string,
 *   search?: string,
 *   createdFrom?: string,
 *   createdTo?: string,
 *   spendingMin?: number|string,
 *   spendingMax?: number|string,
 * }} [params]
 */
export async function getCustomers(params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    sort: params.sort ?? 'ctime',
    status: params.status,
    search: params.search,
    createdFrom: params.createdFrom,
    createdTo: params.createdTo,
    spendingMin: params.spendingMin,
    spendingMax: params.spendingMax,
  });

  const raw = await apiGet(`/user/listcustomer/USER${query}`, {
    tags: ['customers'],
    revalidate: 0,
  });

  return parseList(raw);
}

/** Thống kê trạng thái khách hàng */
export async function getCustomerStats() {
  const raw = await apiGet('/user/customers/stats', {
    tags: ['customers', 'customer-stats'],
    revalidate: 0,
  });
  return raw?.metadata ?? raw ?? {};
}

/** @param {string} userId — user_id public (nanoid) */
export async function getCustomerById(userId) {
  const raw = await apiGet(`/user/customer/${userId}`, {
    tags: [`customer-${userId}`],
    revalidate: 0,
  });
  return raw?.metadata ?? raw;
}

/**
 * @param {string} userId
 * @param {'pending'|'active'|'block'} status
 */
export async function updateCustomerStatus(userId, status) {
  return apiPatch(`/user/customer/${userId}/status`, { status });
}

/**
 * Cập nhật hồ sơ khách hàng.
 * @param {string} userId
 * @param {object} body
 */
export async function updateCustomer(userId, body) {
  return apiPatch(`/user/customer/${userId}`, body);
}

/**
 * @param {string} userId
 * @param {{ page?: number, limit?: number }} [params]
 */
export async function getCustomerAccessLogs(userId, params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
  });
  const raw = await apiGet(`/user/customer/${userId}/access-logs${query}`, {
    revalidate: 0,
  });
  const meta = raw?.metadata ?? raw;
  return {
    items: meta?.items ?? [],
    total: meta?.total ?? 0,
    page: meta?.page ?? 1,
    limit: meta?.limit ?? DEFAULT_LIST_LIMIT,
    hasMore: meta?.hasMore ?? false,
  };
}
