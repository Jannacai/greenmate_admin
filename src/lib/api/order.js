/**
 * Order API — module RBAC: order.
 *
 * GET    /order           — danh sách
 * GET    /order/stats     — thống kê trạng thái
 * GET    /order/:id       — chi tiết
 * PATCH  /order/:id       — cập nhật trạng thái
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
      hasMore: meta.hasMore ?? false,
    };
  }
  return { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT, hasMore: false };
}

/**
 * @param {{ page?: number, limit?: number, status?: string, search?: string, sort?: string }} [params]
 */
export async function getOrders(params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    status: params.status,
    search: params.search,
    sort: params.sort ?? 'ctime',
  });

  const raw = await apiGet(`/order${query}`, {
    revalidate: 0,
    tags: ['orders'],
  });

  return parseList(raw);
}

export async function getOrderStats() {
  const raw = await apiGet('/order/stats', {
    revalidate: 0,
    tags: ['orders', 'order-stats'],
  });
  return raw?.metadata ?? raw ?? {};
}

/** @param {string} id */
export async function getOrderById(id) {
  const raw = await apiGet(`/order/${id}`, {
    revalidate: 0,
    tags: [`order-${id}`],
  });
  return raw?.metadata ?? raw;
}

/**
 * @param {string} id
 * @param {{ order_status: string }} body
 */
export async function updateOrderStatus(id, body) {
  const raw = await apiPatch(`/order/${id}`, body);
  return raw?.metadata ?? raw;
}
