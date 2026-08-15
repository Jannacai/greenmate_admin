'use client';

import Link from 'next/link';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import CustomerRowActions from '@/components/customers/CustomerRowActions';
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import { formatCurrency } from '@/lib/shared/utils';

/**
 * Card mobile danh sách khách hàng.
 * @param {{ customer: object, canUpdate?: boolean }} props
 */
export default function CustomerListCard({ customer, canUpdate = false }) {
  const id = customer.user_id;
  const detailHref = `/customers/${id}`;

  return (
    <ProductListCardNav
      href={detailHref}
      className="rounded-lg border border-gray-200 bg-white p-3 space-y-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={detailHref}
            className="font-semibold text-sm text-brand-dark line-clamp-2 hover:text-brand-primary"
          >
            {customer.user_name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-gray-400">{customer.user_email}</p>
        </div>
        <CustomerStatusBadge status={customer.user_status} plain />
      </div>
      <p className="text-xs text-gray-500">
        Chi tiêu {formatCurrency(customer.totalSpent ?? 0)} · {customer.orderCount ?? 0} đơn
      </p>
      <div className="flex justify-end border-t border-gray-100 pt-2.5">
        <CustomerRowActions
          userId={id}
          status={customer.user_status}
          canUpdate={canUpdate}
          compact
          hideDetailLink
        />
      </div>
    </ProductListCardNav>
  );
}
