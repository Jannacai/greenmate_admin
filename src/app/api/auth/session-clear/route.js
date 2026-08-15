import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { clearSessionOnResponse } from '@/lib/auth/clearSession';

const ALLOWED_REASONS = new Set(['blocked', 'pending', 'session']);

/**
 * GET /api/auth/session-clear?reason=blocked
 * Xóa cookie phiên admin rồi redirect login — gọi từ Server Component khi API trả 403 khóa tài khoản.
 */
export async function GET(request) {
  const rawReason = request.nextUrl.searchParams.get('reason') ?? 'session';
  const reason = ALLOWED_REASONS.has(rawReason) ? rawReason : 'session';

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('reason', reason);

  revalidateTag('my-permissions', 'max');

  const response = NextResponse.redirect(loginUrl);
  return clearSessionOnResponse(response);
}
