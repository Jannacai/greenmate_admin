/**
 * Kiểm tra quyền RBAC trong Server Actions — lớp bảo vệ server-side (bổ sung UI + API).
 */

import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { canAccess } from '@/lib/rbac/permissions';

/** @typedef {{ error: string }} PermissionDenied */

const FORBIDDEN_MESSAGE = 'Bạn không có quyền thực hiện thao tác này';

/**
 * @param {string} action — VD: `read:any`, `update:any`
 * @param {string} resource — src_name module (VD: `product`, `rbac`)
 * @returns {Promise<PermissionDenied|null>} null nếu được phép
 */
export async function requirePermission(action, resource) {
  const perms = await getCachedMyPermissions();
  if (!canAccess(action, resource, perms.grants)) {
    return { error: FORBIDDEN_MESSAGE };
  }
  return null;
}

/**
 * Cho phép nếu user có ít nhất một quyền trong danh sách resource.
 *
 * @param {string} action
 * @param {string[]} resources
 * @returns {Promise<PermissionDenied|null>}
 */
export async function requireAnyPermission(action, resources) {
  const perms = await getCachedMyPermissions();
  for (const resource of resources) {
    if (canAccess(action, resource, perms.grants)) {
      return null;
    }
  }
  return { error: FORBIDDEN_MESSAGE };
}
