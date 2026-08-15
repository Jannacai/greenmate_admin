/**
 * Map pathname → quyền RBAC cần thiết (mức 1 — gate theo route).
 */

import { NAV_GROUPS } from '@/lib/rbac/navConfig';
import { canAccess } from '@/lib/rbac/permissions';

/** @typedef {{ prefix: string, permission: { action: string, resource: string } }} RouteGuard */

/**
 * Flatten permission từ nav config.
 * @returns {RouteGuard[]}
 */
function buildRouteGuards() {
  /** @type {RouteGuard[]} */
  const guards = [];

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.permission) {
        guards.push({ prefix: item.href, permission: item.permission });
      }
    }
  }

  return guards.sort((a, b) => b.prefix.length - a.prefix.length);
}

const ROUTE_GUARDS = buildRouteGuards();

/** Pathname luôn mở sau khi đăng nhập */
const PUBLIC_DASHBOARD_PATHS = new Set(['/dashboard']);

/**
 * @param {string} pathname
 * @returns {{ action: string, resource: string } | null}
 */
export function getRoutePermission(pathname) {
  if (PUBLIC_DASHBOARD_PATHS.has(pathname)) return null;

  // Route con — quyền cụ thể hơn /products (read:any)
  if (/^\/products\/[^/]+\/edit/.test(pathname)) {
    return { action: 'update:any', resource: 'product' };
  }
  if (pathname === '/products/new' || pathname.startsWith('/products/new/')) {
    return { action: 'create:any', resource: 'product' };
  }
  if (pathname === '/inventory/new' || pathname.startsWith('/inventory/new/')) {
    return { action: 'create:any', resource: 'ingredient' };
  }
  if (/^\/inventory\/[^/]+\/edit/.test(pathname)) {
    return { action: 'update:any', resource: 'ingredient' };
  }
  if (/^\/inventory\/[^/]+\/stock/.test(pathname)) {
    return { action: 'update:any', resource: 'ingredient' };
  }
  if (pathname === '/staff/new' || pathname.startsWith('/staff/new/')) {
    return { action: 'update:any', resource: 'staff' };
  }
  if (/^\/vouchers\/[^/]+\/edit/.test(pathname)) {
    return { action: 'update:any', resource: 'discount' };
  }
  if (pathname === '/vouchers/new' || pathname.startsWith('/vouchers/new/')) {
    return { action: 'create:any', resource: 'discount' };
  }
  if (pathname === '/collections/new' || pathname.startsWith('/collections/new/')) {
    return { action: 'create:any', resource: 'collection' };
  }
  if (/^\/collections\/[^/]+\/edit/.test(pathname)) {
    return { action: 'update:any', resource: 'collection' };
  }
  if (pathname === '/categories/new' || pathname.startsWith('/categories/new/')) {
    return { action: 'create:any', resource: 'category' };
  }
  if (/^\/categories\/[^/]+\/edit/.test(pathname)) {
    return { action: 'update:any', resource: 'category' };
  }
  if (
    pathname === '/banners/new' ||
    pathname.startsWith('/banners/new/') ||
    pathname === '/banners/hero/new' ||
    pathname.startsWith('/banners/hero/new/') ||
    pathname === '/banners/category/new' ||
    pathname.startsWith('/banners/category/new/')
  ) {
    return { action: 'create:any', resource: 'banner' };
  }
  if (/^\/banners\/[^/]+\/edit/.test(pathname)) {
    return { action: 'update:any', resource: 'banner' };
  }

  for (const guard of ROUTE_GUARDS) {
    if (pathname === guard.prefix || pathname.startsWith(`${guard.prefix}/`)) {
      return guard.permission;
    }
  }

  return null;
}

/**
 * @param {string} pathname
 * @param {import('@/lib/rbac/permissions').PermissionGrant[]} grants
 */
export function isRouteAllowed(pathname, grants) {
  const permission = getRoutePermission(pathname);
  if (!permission) return true;
  return canAccess(permission.action, permission.resource, grants);
}
