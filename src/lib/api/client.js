/**
 * Base API client — tất cả request đều đi qua đây.
 *
 * Headers bắt buộc theo từng trường hợp:
 *   - Mọi request:         x-api-key  (API_KEY từ env server-only)
 *   - Sau khi đăng nhập:   authorization (accessToken) + x-client-id (userId)
 *
 * Dùng trong Server Components / Server Actions (cookies từ next/headers).
 * Không gọi trực tiếp từ Client Components — dùng Server Actions thay thế.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { refreshAccessToken } from '@/lib/auth/refreshAccessToken';
import { getServerEnv } from '@/lib/shared/env';
import { getAccountAccessDeniedReason, getSessionClearPath } from '@/lib/auth/accountAccess';

const { apiUrl: BASE_URL, apiKey: API_KEY } = getServerEnv();

/** Endpoint auth — không retry refresh khi 401 */
function isAuthEndpoint(endpoint) {
  return (
    endpoint.startsWith('/auth/admin/login') ||
    endpoint.startsWith('/auth/user/login') ||
    endpoint.startsWith('/auth/user/logout') ||
    endpoint.startsWith('/auth/user/refreshtoken')
  );
}

/**
 * Tài khoản bị khóa / chờ duyệt → Route Handler xóa cookie (không ghi cookie trong RSC).
 * @param {number} status
 * @param {string} [message]
 */
function handleAccountAccessDenied(status, message) {
  const reason = getAccountAccessDeniedReason(message);
  if (status !== 403 || !reason) return;

  redirect(getSessionClearPath(reason));
}

/**
 * @param {string} endpoint
 * @param {RequestInit} [options]
 * @param {{ revalidate?: number, tags?: string[] }} [nextOptions]
 * @param {boolean} [retriedAfterRefresh]
 * @returns {Promise<any>}
 */
async function apiFetch(endpoint, options = {}, cacheOptions = {}, retriedAfterRefresh = false) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('admin_token')?.value;
  const clientId = cookieStore.get('admin_client_id')?.value;
  const refreshToken = cookieStore.get('admin_refresh')?.value;

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    ...(accessToken && { authorization: accessToken }),
    ...(clientId && { 'x-client-id': clientId }),
    ...options.headers,
  };

  const { cache, ...nextOptions } = cacheOptions;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    ...(cache ? { cache } : {}),
    next: nextOptions,
  });

  if (res.status === 401) {
    const canRetry =
      !retriedAfterRefresh &&
      Boolean(refreshToken) &&
      !isAuthEndpoint(endpoint);

    if (canRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiFetch(endpoint, options, nextOptions, true);
      }
    }

    redirect(getSessionClearPath('session'));
  }

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const message = body.message ?? '';
    handleAccountAccessDenied(403, message);
    throw new Error(message || `API error 403: ${endpoint}`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `API error ${res.status}: ${endpoint}`);
  }

  return res.json();
}

/**
 * GET — dùng trong Server Components với cache options.
 * @param {string} endpoint
 * @param {{ revalidate?: number, tags?: string[], cache?: RequestCache }} [cacheOptions]
 */
export function apiGet(endpoint, cacheOptions = {}) {
  return apiFetch(endpoint, { method: 'GET' }, cacheOptions);
}

/**
 * POST — dùng trong Server Actions (mutation).
 * @param {string} endpoint
 * @param {object} body
 * @param {Record<string,string>} [extraHeaders]  — headers bổ sung, VD: khi chưa có cookie (login)
 */
export function apiPost(endpoint, body, extraHeaders = {}) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: extraHeaders,
  });
}

/**
 * PUT.
 * @param {string} endpoint
 * @param {object} body
 */
export function apiPut(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * PATCH.
 * @param {string} endpoint
 * @param {object} body
 */
export function apiPatch(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE.
 * @param {string} endpoint
 * @param {object} [body]
 */
export function apiDelete(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'DELETE',
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
}
