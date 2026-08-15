import Link from 'next/link';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { canAccess } from '@/lib/rbac/permissions';
import { PageHeader } from '@/components/admin';

const QUICK_ACTIONS = [
  {
    href: '/products/new',
    label: 'Thêm sản phẩm',
    desc: 'Tạo sản phẩm mới, phân loại và SKU',
    icon: 'product',
    primary: true,
    permission: { action: 'create:any', resource: 'product' },
  },
  {
    href: '/products',
    label: 'Danh sách sản phẩm',
    desc: 'Xem và quản lý tất cả sản phẩm',
    icon: 'list',
    permission: { action: 'read:any', resource: 'product' },
  },
  {
    href: '/customers',
    label: 'Khách hàng',
    desc: 'Danh sách khách hàng và trạng thái tài khoản',
    icon: 'customer',
    permission: { action: 'read:any', resource: 'customer' },
  },
  {
    href: '/orders',
    label: 'Đơn hàng',
    desc: 'Theo dõi đơn hàng mới',
    icon: 'order',
    permission: { action: 'read:any', resource: 'order' },
  },
];

/**
 * Trang tổng quan dashboard.
 */
export default async function DashboardPage() {
  const permissions = await getCachedMyPermissions();
  const actions = QUICK_ACTIONS.filter((action) =>
    canAccess(action.permission.action, action.permission.resource, permissions.grants),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader title="Tổng quan" />

      {actions.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  action.primary
                    ? 'group flex items-start gap-4 rounded-xl border border-brand-primary/20 bg-brand-primary p-4 text-white shadow-sm hover:bg-sidebar-hover transition-colors'
                    : 'group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all'
                }
              >
                <div
                  className={
                    action.primary
                      ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15'
                      : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors'
                  }
                >
                  <QuickActionIcon name={action.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className={action.primary ? 'font-semibold text-white' : 'font-semibold text-brand-dark'}>
                    {action.label}
                  </p>
                  <p className={action.primary ? 'mt-0.5 text-xs text-white/70' : 'mt-0.5 text-xs text-gray-400'}>
                    {action.desc}
                  </p>
                </div>
                <svg
                  className={
                    action.primary
                      ? 'ml-auto h-4 w-4 shrink-0 text-white/50 group-hover:text-white/80'
                      : 'ml-auto h-4 w-4 shrink-0 text-gray-300 group-hover:text-gray-500'
                  }
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-gray-500">
          Chọn một mục từ menu bên trái để bắt đầu làm việc.
        </p>
      )}
    </div>
  );
}

function QuickActionIcon({ name, className }) {
  if (name === 'product') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    );
  }
  if (name === 'list') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  }
  if (name === 'customer') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
