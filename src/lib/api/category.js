/**
 * Category API — module RBAC: category.
 *
 * Public:
 *   GET /category/public/tree?product_type=
 *   GET /category/public/:slug
 *
 * Admin:
 *   GET    /category
 *   GET    /category/stats
 *   GET    /category/picker/level2?product_type=
 *   GET    /category/:id
 *   POST   /category/create
 *   PATCH  /category/:id
 *   POST   /category/publish/:id
 *   POST   /category/unpublish/:id
 *   DELETE /category/:id
 */

import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

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
    };
  }
  if (Array.isArray(meta)) {
    return { items: meta, total: meta.length, page: 1, limit: meta.length };
  }
  return { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };
}

export async function getCategories(params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    status: params.status,
    level: params.level,
    product_type: params.product_type,
    parent_id: params.parent_id,
    search: params.search,
    sort: params.sort ?? 'sort_asc',
  });

  const raw = await apiGet(`/category${query}`, {
    revalidate: 0,
    tags: ['categories'],
  });
  return parseList(raw);
}

export async function getCategoryStats() {
  const raw = await apiGet('/category/stats', {
    revalidate: 0,
    tags: ['categories', 'category-stats'],
  });
  return raw?.metadata ?? raw ?? {};
}

/** @param {{ product_type?: string, search?: string }} [params] */
export async function getCategoryLevel2Picker(params = {}) {
  const query = buildQuery(params);
  const raw = await apiGet(`/category/picker/level2${query}`, {
    revalidate: 0,
    tags: ['categories', 'category-picker'],
  });
  return raw?.metadata ?? raw ?? [];
}

/** @param {string} id */
export async function getCategoryById(id) {
  const raw = await apiGet(`/category/${id}`, {
    revalidate: 0,
    tags: [`category-${id}`],
  });
  return raw?.metadata ?? raw;
}

/** @param {object} body */
export async function createCategory(body) {
  const raw = await apiPost('/category/create', body);
  return raw?.metadata ?? raw;
}

/** @param {string} id @param {object} body */
export async function updateCategory(id, body) {
  const raw = await apiPatch(`/category/${id}`, body);
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function publishCategory(id) {
  const raw = await apiPost(`/category/publish/${id}`, {});
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function unpublishCategory(id) {
  const raw = await apiPost(`/category/unpublish/${id}`, {});
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function deleteCategory(id) {
  const raw = await apiDelete(`/category/${id}`);
  return raw?.metadata ?? raw;
}
