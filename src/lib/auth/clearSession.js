/**
 * Cookie phiên admin — xóa qua Server Action hoặc Route Handler (không ghi cookie trong Server Component).
 */

import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE_NAMES = [
  'admin_token',
  'admin_client_id',
  'admin_shop_id',
  'admin_refresh',
  'admin_user_name',
  'admin_user_email',
];

export const COOKIE_DELETE = { path: '/', maxAge: 0 };

/** @param {import('next/server').NextResponse} response */
export function clearSessionOnResponse(response) {
  for (const name of ADMIN_SESSION_COOKIE_NAMES) {
    response.cookies.set(name, '', COOKIE_DELETE);
  }
  return response;
}

/** Chỉ dùng trong Server Action (logoutAction…) */
export async function clearAdminSessionCookies() {
  const cookieStore = await cookies();
  for (const name of ADMIN_SESSION_COOKIE_NAMES) {
    cookieStore.set(name, '', COOKIE_DELETE);
  }
}
