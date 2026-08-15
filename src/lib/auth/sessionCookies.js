/**
 * Cookie phiên admin — TTL khớp JWT tipjs (access 2 ngày, refresh 7 ngày).
 */

/** Khớp accessToken JWT: expiresIn '2 day' */
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 2;

/** Khớp refreshToken JWT: expiresIn '7 day' */
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * @param {number} maxAge
 * @param {{ httpOnly?: boolean }} [opts]
 */
export function buildSessionCookieOptions(maxAge, opts = {}) {
  return {
    httpOnly: opts.httpOnly !== false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export const ACCESS_COOKIE_OPTIONS = buildSessionCookieOptions(ACCESS_COOKIE_MAX_AGE);
export const REFRESH_COOKIE_OPTIONS = buildSessionCookieOptions(REFRESH_COOKIE_MAX_AGE);
export const SHOP_COOKIE_OPTIONS = buildSessionCookieOptions(REFRESH_COOKIE_MAX_AGE);
export const PROFILE_COOKIE_OPTIONS = buildSessionCookieOptions(
  REFRESH_COOKIE_MAX_AGE,
  { httpOnly: false },
);
