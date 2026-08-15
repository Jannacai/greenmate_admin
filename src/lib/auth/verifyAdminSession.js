/**
 * Xác thực phiên admin qua API tipjs (JWT per-user key — verify phía backend).
 */

const DEV_DEFAULT_API_URL = 'http://localhost:3055/api/v1';

/**
 * @param {string | undefined} token
 * @param {string | undefined} clientId — MongoDB _id user (x-client-id)
 * @returns {Promise<boolean>}
 */
export async function verifyAdminSession(token, clientId) {
  if (!token || !clientId) return false;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || DEV_DEFAULT_API_URL;
  const apiKey = process.env.API_KEY?.trim() ?? '';
  if (!apiKey) return false;

  try {
    const res = await fetch(`${apiUrl}/auth/me/permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        authorization: token,
        'x-client-id': clientId,
      },
      cache: 'no-store',
    });

    return res.ok;
  } catch {
    return false;
  }
}
