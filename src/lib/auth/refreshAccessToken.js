/**
 * Cấp lại accessToken từ refreshToken cookie.
 * Tách riêng để apiFetch và refreshTokenAction dùng chung — tránh circular import.
 */

import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/shared/env';
import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/auth/sessionCookies';

const { apiUrl: BASE_URL, apiKey: API_KEY } = getServerEnv();

/**
 * @returns {Promise<boolean>} true nếu refresh thành công và cookie đã cập nhật
 */
export async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('admin_refresh')?.value;
  const clientId = cookieStore.get('admin_client_id')?.value;

  if (!refreshToken || !clientId) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/user/refreshtoken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        refreshtoken: refreshToken,
        'x-client-id': clientId,
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    });

    if (!res.ok) return false;

    const data = await res.json();
    const inner = data.metadata?.data ?? data.metadata ?? data;
    const newTokens = inner.tokens ?? inner;

    if (!newTokens?.accessToken) return false;

    cookieStore.set('admin_token', newTokens.accessToken, ACCESS_COOKIE_OPTIONS);
    cookieStore.set(
      'admin_refresh',
      newTokens.refreshToken ?? refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    return true;
  } catch {
    return false;
  }
}
