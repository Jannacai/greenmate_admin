'use server';

import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { loginAdmin } from '@/lib/api/auth';
import { apiPost } from '@/lib/api/client';
import { refreshAccessToken } from '@/lib/auth/refreshAccessToken';
import { clearAdminSessionCookies } from '@/lib/auth/clearSession';
import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  SHOP_COOKIE_OPTIONS,
  PROFILE_COOKIE_OPTIONS,
} from '@/lib/auth/sessionCookies';
import { cookies } from 'next/headers';
import { authErrorMessage } from '@/lib/shared/actionError';

/**
 * Server Action: đăng nhập.
 *
 * @param {Object} prevState
 * @param {FormData} formData  — fields: identifier, password
 * @returns {{ error?: string, fieldErrors?: Record<string,string[]> }}
 */
export async function loginAction(prevState, formData) {
  const identifier = (formData.get('identifier') ?? '').toString().trim();
  const password   = (formData.get('password') ?? '').toString();

  const { parseLoginIdentifier } = await import('@/lib/shared/phone');
  const parsed = parseLoginIdentifier(identifier);

  if (parsed.error) {
    return { fieldErrors: { identifier: [parsed.error] } };
  }

  if (!password || password.length < 6) {
    return { fieldErrors: { password: ['Mật khẩu tối thiểu 6 ký tự'] } };
  }

  try {
    const credentials = parsed.type === 'phone'
      ? { phone: parsed.phone, password }
      : { email: parsed.email, password };
    const { user, tokens } = await loginAdmin(credentials);
    const cookieStore = await cookies();

    cookieStore.set('admin_token', tokens.accessToken, ACCESS_COOKIE_OPTIONS);
    cookieStore.set('admin_client_id', user._id, ACCESS_COOKIE_OPTIONS);
    cookieStore.set('admin_shop_id', user.shop_owner_id || user._id, SHOP_COOKIE_OPTIONS);
    cookieStore.set('admin_refresh', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    cookieStore.set('admin_user_name', user.name, PROFILE_COOKIE_OPTIONS);
    cookieStore.set('admin_user_email', user.email, PROFILE_COOKIE_OPTIONS);
    updateTag('my-permissions');
  } catch (err) {
    return { error: authErrorMessage(err, 'Đăng nhập thất bại, vui lòng thử lại') };
  }

  redirect('/dashboard');
}

/**
 * Server Action: đăng xuất.
 * Gọi API backend để invalidate token, sau đó xóa cookie.
 *
 * API: POST /auth/user/logout
 * Headers cần: x-api-key + authorization + x-client-id  (đã có trong cookie)
 */
export async function logoutAction() {
  // Gọi API backend trước để invalidate token phía server
  // Dùng apiPost — tự đọc cookie và gắn đủ 3 headers
  try {
    await apiPost('/auth/user/logout', {});
  } catch {
    // Nếu API lỗi (token đã hết hạn, network...) vẫn tiếp tục xóa cookie
  }

  await clearAdminSessionCookies();
  updateTag('my-permissions');

  redirect('/login');
}

/**
 * Server Action: cấp lại accessToken khi hết hạn.
 * Gọi tự động từ apiFetch khi nhận 401.
 *
 * API: POST /auth/user/refreshtoken
 * Headers cần: x-api-key + authorization (refreshToken) + x-client-id
 *
 * @returns {Promise<boolean>} true nếu refresh thành công
 */
export async function refreshTokenAction() {
  return refreshAccessToken();
}

