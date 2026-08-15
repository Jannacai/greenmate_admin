/**
 * Auth API — đăng nhập admin, đăng xuất.
 *
 * Endpoint base: /auth
 *   POST /auth/admin/login — đăng nhập dashboard (ADMIN / STAFF only)
 *   POST /auth/user/logout — cần authorization + x-client-id
 */

import { getServerEnv } from '@/lib/shared/env';

const { apiUrl: BASE_URL, apiKey: API_KEY } = getServerEnv();

/**
 * @param {object} data
 * @returns {Promise<{ metadata?: object, message?: string }>}
 */
async function parseAuthResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(data.message ?? 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau.');
    }
    throw new Error(data.message ?? 'Đăng nhập thất bại');
  }
  return data;
}

/**
 * @param {object} data
 * @returns {{ user: object, tokens: object }}
 */
function normalizeLoginPayload(data) {
  const data_  = data.metadata?.data ?? data.metadata ?? data;
  const user   = data_.user  ?? {};
  const tokens = data_.tokens ?? {};

  const accessToken  = tokens.accessToken  ?? null;
  const refreshToken = tokens.refreshToken ?? '';

  if (!accessToken) {
    throw new Error('Không tìm thấy accessToken trong response. Kiểm tra server tipjs.');
  }

  return {
    user: {
      _id:        user._id        ?? '',
      name:       user.user_name  ?? user.name  ?? user.user_email ?? '',
      email:      user.user_email ?? user.email ?? '',
      role_type:  user.role_type  ?? user.role  ?? '',
      role_slug:  user.role_slug  ?? '',
      shop_owner_id: user.shop_owner_id ?? '',
    },
    tokens: { accessToken, refreshToken },
  };
}

/**
 * Đăng nhập GreenMate Admin — POST /auth/admin/login
 * Chỉ tài khoản ADMIN / STAFF (backend từ chối USER).
 *
 * @param {{ email?: string, phone?: string, password: string }} credentials
 */
export async function loginAdmin({ email, password, phone }) {
  const hasEmail = email != null && String(email).trim() !== '';
  const hasPhone = phone != null && String(phone).trim() !== '';

  /** @type {Record<string, string>} */
  const body = { password };
  if (hasEmail) {
    body.email = String(email).trim();
  } else if (hasPhone) {
    body.phone = String(phone).trim();
  }

  const res = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(body),
    revalidate: 0,
  });

  const data = await parseAuthResponse(res);
  return normalizeLoginPayload(data);
}

/** @deprecated Dùng loginAdmin cho dashboard. Giữ cho storefront user login sau này. */
export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ email, password }),
    revalidate: 0,
  });

  const data = await parseAuthResponse(res);
  return normalizeLoginPayload(data);
}
