/**
 * Permissions API — quyền RBAC của user đang đăng nhập.
 */

import { apiGet } from '@/lib/api/client';

/** GET /auth/me/permissions — luôn fetch tươi (tránh cache grants rỗng) */
export function getMyPermissions() {
  return apiGet('/auth/me/permissions', {
    tags: ['my-permissions'],
    revalidate: 0,
  });
}
