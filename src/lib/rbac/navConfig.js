/**
 * Cấu hình navigation dashboard — dùng chung Sidebar, MobileBottomNav, route guard.
 *
 * Nhóm menu theo luồng vận hành:
 * - Tổng quan → danh mục SP & tồn → bán hàng → marketing → hệ thống
 *
 * `permission.resource` = **src_name** trong collection Resources (VD: `rbac`, `product`, `staff`, `customer`),
 * KHÔNG phải src_slug (VD: RBAC0001). Cùng key mà backend dùng trong grantAccess(..., 'rbac').
 *
 * @typedef {{ action: string, resource: string }} NavPermission
 * @typedef {{ href: string, label: string, icon: string, permission?: NavPermission | null }} NavItem
 * @typedef {{ label: string, items: NavItem[] }} NavGroup
 */

/** @type {NavGroup[]} */
export const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { href: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
    ],
  },
  {
    label: 'Sản phẩm & kho',
    items: [
      {
        href: '/products',
        label: 'Sản phẩm',
        icon: 'product',
        permission: { action: 'read:any', resource: 'product' },
      },
      {
        href: '/categories',
        label: 'Loại sản phẩm',
        icon: 'category',
        permission: { action: 'read:any', resource: 'category' },
      },
      {
        href: '/collections',
        label: 'Bộ sưu tập',
        icon: 'collection',
        permission: { action: 'read:any', resource: 'collection' },
      },
      {
        href: '/inventory',
        label: 'Tồn kho',
        icon: 'inventory',
        permission: { action: 'read:any', resource: 'ingredient' },
      },
    ],
  },
  {
    label: 'Bán hàng',
    items: [
      {
        href: '/orders',
        label: 'Đơn hàng',
        icon: 'order',
        permission: { action: 'read:any', resource: 'order' },
      },
      {
        href: '/customers',
        label: 'Khách hàng',
        icon: 'customer',
        permission: { action: 'read:any', resource: 'customer' },
      },
      {
        href: '/reviews',
        label: 'Đánh giá',
        icon: 'review',
        permission: { action: 'read:any', resource: 'comment' },
      },
    ],
  },
  {
    label: 'Marketing',
    items: [
      {
        href: '/banners',
        label: 'Banner',
        icon: 'banner',
        permission: { action: 'read:any', resource: 'banner' },
      },
      {
        href: '/vouchers',
        label: 'Voucher',
        icon: 'voucher',
        permission: { action: 'read:any', resource: 'discount' },
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        href: '/staff',
        label: 'Nhân viên',
        icon: 'staff',
        permission: { action: 'read:any', resource: 'staff' },
      },
      {
        href: '/rbac',
        label: 'Phân quyền',
        icon: 'shield',
        permission: { action: 'read:any', resource: 'rbac' },
      },
      {
        href: '/notifications',
        label: 'Thông báo',
        icon: 'bell',
        permission: { action: 'read:any', resource: 'notifi' },
      },
      {
        href: '/settings',
        label: 'Cài đặt',
        icon: 'settings',
        permission: { action: 'read:own', resource: 'profile' },
      },
    ],
  },
];

/** Tab bottom mobile — shortcut thao tác hàng ngày */
export const MOBILE_BOTTOM_TABS = [
  { href: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
  {
    href: '/products',
    label: 'Sản phẩm',
    icon: 'product',
    permission: { action: 'read:any', resource: 'product' },
  },
  {
    href: '/orders',
    label: 'Đơn hàng',
    icon: 'order',
    permission: { action: 'read:any', resource: 'order' },
  },
  {
    href: '/customers',
    label: 'Khách hàng',
    icon: 'customer',
    permission: { action: 'read:any', resource: 'customer' },
  },
];
