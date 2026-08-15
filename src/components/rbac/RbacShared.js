'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { getActionLabel, getRoleTypeLabel, getRoleTypeTextClass } from '@/lib/rbac/rbacConstants';
import { cn } from '@/lib/shared/utils';

export const RBAC_TAB_ITEMS = [
  { id: 'matrix', label: 'Tổng quan', countKey: 'matrix' },
  { id: 'roles', label: 'Vai trò & quyền', countKey: 'roles' },
  { id: 'resources', label: 'Module', countKey: 'resources' },
];

export const RBAC_TABLE_HEAD =
  'px-3 py-2.5 text-center text-[13.5px] font-bold uppercase tracking-wide text-brand-dark whitespace-nowrap';

export const RBAC_TABLE_CELL = 'align-middle px-3 py-2.5 text-sm';

/**
 * Tab điều hướng — URL state (tab/page/limit), style đồng bộ StatusFilterTabs.
 */
export function RbacTabBar({ activeTab, counts }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2 md:p-2.5">
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 md:text-xs">
        Quản lý phân quyền
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-2">
        {RBAC_TAB_ITEMS.map((tab) => {
          const params = new URLSearchParams(searchParams.toString());
          if (tab.id === 'matrix') params.delete('tab');
          else params.set('tab', tab.id);
          params.delete('page');

          const href = params.toString() ? `${pathname}?${params}` : pathname;
          const active = activeTab === tab.id;
          const count = counts?.[tab.countKey];

          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg border font-semibold transition-colors px-3 py-2 text-xs md:text-sm',
                active
                  ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                  : 'border-gray-200 bg-brand-gray text-gray-600 hover:border-brand-primary hover:text-brand-primary',
              )}
            >
              <span>{tab.label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    'min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center font-extrabold tabular-nums leading-none text-[13px] md:text-[14px]',
                    active
                      ? 'bg-white/25 text-white'
                      : 'bg-white text-gray-700 ring-1 ring-gray-200',
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Banner chế độ chỉ xem */
export function RbacReadOnlyBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
      <p>
        <strong className="font-semibold">Chế độ chỉ xem</strong>
        {' — '}
        Bạn có quyền đọc module phân quyền, không thể tạo, sửa hoặc xóa.
      </p>
    </div>
  );
}

/** Hiển thị quyền dạng nhãn tiếng Việt */
export function RbacActionBadge({ action, compact = false }) {
  const label = getActionLabel(action);
  return (
    <Badge
      variant="secondary"
      className={cn(
        'rounded-md bg-blue-50 font-medium text-blue-800 hover:bg-blue-50',
        compact ? 'text-[10px]' : 'text-xs',
      )}
      title={action}
    >
      {label}
    </Badge>
  );
}

/**
 * Nhãn loại tài khoản — admin đỏ, nhân viên xanh biển, khách hàng xanh lá.
 * @param {{ roleType?: string, active?: boolean, className?: string }} props
 */
export function RoleTypeBadge({ roleType, active = false, className }) {
  const label = getRoleTypeLabel(roleType);

  if (active) {
    return (
      <span className={cn('font-medium text-white/90', className)} title={label}>
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn('text-xs font-semibold', getRoleTypeTextClass(roleType), className)}
      title={label}
    >
      {label}
    </span>
  );
}

/** Empty state đồng bộ trang list admin */
export function RbacEmptyState({ title, description, icon = 'shield' }) {
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-gray-200 bg-white">
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
          {icon === 'module' ? (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          ) : (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          )}
        </div>
        <h2 className="mt-4 text-base font-semibold text-brand-dark">{title}</h2>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}
