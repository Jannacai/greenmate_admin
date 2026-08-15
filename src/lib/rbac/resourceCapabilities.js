/**
 * Quyền thao tác theo module — dùng ẩn nút Sửa/Xóa/Thêm (mức 2 RBAC frontend).
 */

import { canAccess } from '@/lib/rbac/permissions';

/**
 * @typedef {{
 *   canRead: boolean,
 *   canCreate: boolean,
 *   canUpdate: boolean,
 *   canDelete: boolean,
 * }} ResourceCapabilities
 */

/**
 * @param {string} resource — src_name module (VD: product, rbac)
 * @param {import('@/lib/rbac/permissions').PermissionGrant[]} grants
 * @returns {ResourceCapabilities}
 */
export function getResourceCapabilities(resource, grants) {
  return {
    canRead: canAccess('read:any', resource, grants),
    canCreate: canAccess('create:any', resource, grants),
    canUpdate: canAccess('update:any', resource, grants),
    canDelete: canAccess('delete:any', resource, grants),
  };
}
