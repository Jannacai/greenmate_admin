/**
 * Collection API — module RBAC: collection.
 *
 * Base path: /collection
 *
 * AUTH + grantAccess:
 *   GET    /collection              — danh sách (?status, ?search, ?sort)
 *   GET    /collection/stats        — thống kê lifecycle
 *   GET    /collection/:id          — chi tiết
 *   POST   /collection/create       — tạo mới
 *   PATCH  /collection/:id          — cập nhật
 *   POST   /collection/publish/:id  — xuất bản
 *   POST   /collection/unpublish/:id — ẩn
 *   DELETE /collection/:id          — xóa
 */

import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client';
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
 * @param {{ page?: number, limit?: number, status?: string, search?: string, sort?: string }} [params]
 */
export async function getCollections(params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    status: params.status,
    search: params.search,
    sort: params.sort ?? 'ctime',
  });

  const raw = await apiGet(`/collection${query}`, {
    revalidate: 0,
    tags: ['collections'],
  });

  return parseList(raw);
}

export async function getCollectionStats() {
  const raw = await apiGet('/collection/stats', {
    revalidate: 0,
    tags: ['collections', 'collection-stats'],
  });
  return raw?.metadata ?? raw ?? {};
}

/** @param {string} id */
export async function getCollectionById(id) {
  const raw = await apiGet(`/collection/${id}`, {
    revalidate: 0,
    tags: [`collection-${id}`],
  });
  return raw?.metadata ?? raw;
}

/** @param {object} body */
export async function createCollection(body) {
  const raw = await apiPost('/collection/create', body);
  return raw?.metadata ?? raw;
}

/**
 * @param {string} id
 * @param {object} body
 */
export async function updateCollection(id, body) {
  const raw = await apiPatch(`/collection/${id}`, body);
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function publishCollection(id) {
  const raw = await apiPost(`/collection/publish/${id}`, {});
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function unpublishCollection(id) {
  const raw = await apiPost(`/collection/unpublish/${id}`, {});
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function deleteCollection(id) {
  const raw = await apiDelete(`/collection/${id}`);
  return raw?.metadata ?? raw;
}
