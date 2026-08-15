/**
 * Banner API — module RBAC: banner.
 *
 * Base path: /banner
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
      hasMore: meta.hasMore ?? false,
    };
  }
  return { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT, hasMore: false };
}

/**
 * @param {{ page?: number, limit?: number, status?: string, placement?: string, kind?: string, search?: string, sort?: string }} [params]
 */
export async function getBanners(params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    status: params.status,
    placement: params.placement,
    kind: params.kind,
    search: params.search,
    sort: params.sort ?? 'sort_asc',
  });

  const raw = await apiGet(`/banner${query}`, {
    revalidate: 0,
    tags: ['banners'],
  });

  return parseList(raw);
}

/**
 * @param {{ placement?: string, kind?: string }} [params]
 */
export async function getBannerStats(params = {}) {
  const query = buildQuery({ placement: params.placement, kind: params.kind });
  const raw = await apiGet(`/banner/stats${query}`, {
    revalidate: 0,
    tags: ['banners', 'banner-stats'],
  });
  return raw?.metadata ?? raw ?? {};
}

/** @param {string} id */
export async function getBannerById(id) {
  const raw = await apiGet(`/banner/${id}`, {
    revalidate: 0,
    tags: [`banner-${id}`],
  });
  return raw?.metadata ?? raw;
}

/** @param {object} body */
export async function createBanner(body) {
  const raw = await apiPost('/banner/create', body);
  return raw?.metadata ?? raw;
}

/** @param {string} id @param {object} body */
export async function updateBanner(id, body) {
  const raw = await apiPatch(`/banner/${id}`, body);
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function publishBanner(id) {
  const raw = await apiPost(`/banner/publish/${id}`, {});
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function unpublishBanner(id) {
  const raw = await apiPost(`/banner/unpublish/${id}`, {});
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function deleteBanner(id) {
  const raw = await apiDelete(`/banner/${id}`);
  return raw?.metadata ?? raw;
}
