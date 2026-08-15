/**
 * Staff API — quản lý nhân viên (module RBAC: staff).
 *
 *   GET   /user/liststaff
 *   GET   /user/staff/:id
 *   PATCH /user/staff/:id/status
 *   PATCH /user/staff/:id
 *   GET   /user/staff/:id/access-logs
 *   POST  /auth/staff/signup/:roleSlug — update:any staff
 */

import { apiGet, apiPatch, apiPost } from '@/lib/api/client';
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
      hasMore: meta.hasMore ?? meta.items.length < (meta.total ?? 0),
    };
  }
  return { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT, hasMore: false };
}

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   sort?: string,
 *   status?: string,
 *   search?: string,
 *   createdFrom?: string,
 *   createdTo?: string,
 *   roleFilter?: ''|'STAFF'|'ADMIN',
 * }} [params]
 */
export async function getStaffMembers(params = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    sort: params.sort ?? 'ctime',
    status: params.status,
    search: params.search,
    createdFrom: params.createdFrom,
    createdTo: params.createdTo,
    roleFilter: params.roleFilter,
  });

  const raw = await apiGet(`/user/liststaff${query}`, {
    tags: ['staff'],
    revalidate: 0,
  });
  return parseList(raw);
}

/** Thống kê trạng thái nhân viên */
export async function getStaffStats() {
  const raw = await apiGet('/user/staff/stats', {
    tags: ['staff', 'staff-stats'],
    revalidate: 0,
  });
  return raw?.metadata ?? raw ?? {};
}

/** @param {string} userId */
export async function getStaffById(userId) {
  const raw = await apiGet(`/user/staff/${userId}`, {
    tags: [`staff-${userId}`],
    revalidate: 0,
  });
  return raw?.metadata ?? raw;
}

/** @param {string} userId @param {'pending'|'active'|'block'} status @param {string} [actorPassword] */
export async function updateStaffStatus(userId, status, actorPassword) {
  return apiPatch(`/user/staff/${userId}/status`, {
    status,
    ...(actorPassword ? { actorPassword } : {}),
  });
}

/**
 * @param {string} userId
 * @param {object} body
 */
export async function updateStaffMember(userId, body) {
  return apiPatch(`/user/staff/${userId}`, body);
}

/** @param {string} userId @param {{ page?: number, limit?: number }} [params] */
export async function getStaffAccessLogs(userId, params = {}) {
  const query = buildQuery({ page: params.page ?? 1, limit: params.limit ?? 20 });
  const raw = await apiGet(`/user/staff/${userId}/access-logs${query}`, { revalidate: 0 });
  const meta = raw?.metadata ?? raw;
  return {
    items: meta?.items ?? [],
    total: meta?.total ?? 0,
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 20,
    hasMore: meta?.hasMore ?? false,
  };
}

export function signUpStaff(roleSlug, body) {
  const slug = encodeURIComponent(roleSlug);
  return apiPost(`/auth/staff/signup/${slug}`, body);
}
