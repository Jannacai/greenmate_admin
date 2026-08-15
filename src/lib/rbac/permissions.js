/**
 * Kiểm tra quyền RBAC phía frontend (UX gate — backend vẫn là lớp bảo mật thật).
 * ADMIN và STAFF đều tuân theo grants trong DB — không bypass theo role_type.
 */

import { normalizeRbacAction } from '@/lib/rbac/rbacConstants';

/**
 * @typedef {{ resource: string, actions: string[] }} PermissionGrant
 * @typedef {{ role_slug?: string, role_type?: string, role_name?: string, grants?: PermissionGrant[] }} MyPermissions
 */

/**
 * Chuẩn hóa response API /auth/me/permissions.
 * @param {any} raw
 * @returns {MyPermissions}
 */
export function normalizeMyPermissions(raw) {
  const meta = raw?.metadata ?? raw?.data ?? raw ?? {};
  return {
    role_slug: meta.role_slug ?? '',
    role_type: meta.role_type ?? '',
    role_name: meta.role_name ?? '',
    grants: (meta.grants ?? []).map((g) => ({
      resource: String(g.resource ?? '').toLowerCase(),
      resource_slug: g.resource_slug ?? '',
      resource_name: g.resource_name ?? g.resource ?? '',
      actions: (g.actions ?? []).map(normalizeRbacAction),
    })),
  };
}

/**
 * @param {PermissionGrant[]} grants
 * @param {string} resource
 * @returns {string[]}
 */
function actionsForResource(grants, resource) {
  const key = String(resource).toLowerCase();
  const matched = (grants ?? []).filter((g) => String(g.resource).toLowerCase() === key);
  if (!matched.length) return [];
  return [...new Set(matched.flatMap((g) => g.actions ?? []))];
}

/**
 * Kiểm tra user có action cụ thể trên resource.
 * Với `read:any` / `update:any` — chấp nhận thêm bản `:own` (đủ xem/trang cơ bản).
 *
 * @param {string} action — VD: `read:any`, `update:any`
 * @param {string} resource — VD: `product`, `rbac`
 * @param {PermissionGrant[]} grants
 */
export function canAccess(action, resource, grants) {
  const normalized = normalizeRbacAction(action);
  const available = actionsForResource(grants, resource);

  if (available.includes(normalized)) return true;

  const [verb, scope] = normalized.split(':');
  if (scope === 'any') {
    return available.includes(`${verb}:own`);
  }

  return false;
}

/**
 * @param {{ action: string, resource: string } | null | undefined} permission
 * @param {PermissionGrant[]} grants
 */
export function canNavItem(permission, grants) {
  if (!permission) return true;
  return canAccess(permission.action, permission.resource, grants);
}

/**
 * Lọc nav groups theo quyền.
 * @param {import('@/lib/rbac/navConfig').NavGroup[]} groups
 * @param {PermissionGrant[]} grants
 */
export function filterNavGroups(groups, grants) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canNavItem(item.permission, grants)),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * Lọc danh sách tab mobile.
 * @param {import('@/lib/rbac/navConfig').NavItem[]} tabs
 * @param {PermissionGrant[]} grants
 */
export function filterMobileTabs(tabs, grants) {
  return tabs.filter((tab) => canNavItem(tab.permission, grants));
}
