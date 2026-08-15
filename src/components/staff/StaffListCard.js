'use client';

import Link from 'next/link';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import StaffRowActions from '@/components/staff/StaffRowActions';
import StaffRoleBadge from '@/components/staff/StaffRoleBadge';
import { formatDate, cn } from '@/lib/shared/utils';

/**
 * Card mobile danh sách nhân viên.
 * @param {{ member: object, canUpdate?: boolean }} props
 */
export default function StaffListCard({ member, canUpdate = false }) {
  const detailHref = `/staff/${member.user_id}`;

  return (
    <ProductListCardNav
      href={detailHref}
      className="rounded-lg border border-gray-200 bg-white p-3"
    >
      <div className="flex items-start gap-2.5">
        <StaffAvatar name={member.user_name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={detailHref}
                className="line-clamp-2 text-sm font-semibold text-brand-dark hover:text-brand-primary"
              >
                {member.user_name}
              </Link>
              <p className="mt-0.5 truncate text-xs text-gray-400">{member.user_email}</p>
            </div>
            <CustomerStatusBadge status={member.user_status} plain />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StaffRoleBadge
              roleType={member.user_role?.role_type}
              roleName={member.user_role?.role_name}
            />
            <span className="text-[10px] text-gray-400">
              {member.createdAt ? formatDate(member.createdAt, 'datetime') : '—'}
            </span>
          </div>
          <div className="mt-2.5 flex justify-end border-t border-gray-100 pt-2.5">
            <StaffRowActions
              userId={member.user_id}
              status={member.user_status}
              canUpdate={canUpdate}
              compact
            />
          </div>
        </div>
      </div>
    </ProductListCardNav>
  );
}

/**
 * @param {{ name?: string, size?: 'sm' | 'md' }} props
 */
export function StaffAvatar({ name = '', size = 'md' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-primary/10 font-bold text-brand-primary',
        size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs',
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
