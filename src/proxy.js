import { NextResponse } from 'next/server';
import { clearSessionOnResponse } from '@/lib/auth/clearSession';
import { verifyAdminSession } from '@/lib/auth/verifyAdminSession';

/**
 * Proxy (Next.js 16 — thay thế middleware.js).
 * Bảo vệ routes dashboard: cookie + xác thực JWT qua API tipjs.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('admin_token')?.value;
  const clientId = request.cookies.get('admin_client_id')?.value;

  const isLoginPage = pathname === '/login' || pathname.startsWith('/login/');

  if (!token || !clientId) {
    if (isLoginPage) return NextResponse.next();
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  const sessionValid = await verifyAdminSession(token, clientId);
  if (!sessionValid) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    url.searchParams.set('session', 'expired');
    const res = NextResponse.redirect(url);
    clearSessionOnResponse(res);
    return res;
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const res = NextResponse.next();
  res.headers.set('x-user-client-id', clientId);
  res.headers.set('x-pathname', pathname);
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
