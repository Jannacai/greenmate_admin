'use client';

import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import {
  getOrderCustomerId,
  getOrderCustomerName,
  getOrderPaymentLabel,
  getOrderStatusKey,
} from '@/lib/orders/orderDisplay';
import { formatCurrency, formatDate, cn } from '@/lib/shared/utils';
import {
  ORDER_TABLE_CELL_BASE,
  ORDER_TABLE_COL,
  ORDER_TABLE_DIVIDER,
} from '@/components/orders/orderListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

const STATUS_ROW_ACCENT = {
  pending: 'shadow-[inset_3px_0_0_0_#fbbf24]',
  confirmed: 'shadow-[inset_3px_0_0_0_#60a5fa]',
  shipped: 'shadow-[inset_3px_0_0_0_#c084fc]',
  delivered: 'shadow-[inset_3px_0_0_0_#4ade80]',
  cancelled: 'shadow-[inset_3px_0_0_0_#fb7185]',
};

/**
 * @param {{ order: object }} props
 */
export default function OrderListCard({ order }) {
  const id = String(order._id);
  const detailHref = `/orders/${id}`;
  const customerId = getOrderCustomerId(order);
  const tracking = order.order_trackingNumber;
  const paymentLabel = getOrderPaymentLabel(order, { short: true });

  return (
    <ProductListCardNav
      href={detailHref}
      className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-brand-primary/30 md:hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {tracking ? (
            <div data-card-nav-block>
              <ProductIdCopy
                id={tracking}
                plain
                showLabel={false}
                label="Mã đơn hàng"
                className="w-fit max-w-full"
              />
            </div>
          ) : (
            <p className="text-xs text-gray-400">—</p>
          )}
          <p className="truncate text-xs font-semibold text-brand-dark">
            {getOrderCustomerName(order)}
          </p>
          {customerId && customerId !== '—' ? (
            <div data-card-nav-block>
              <ProductIdCopy
                id={customerId}
                plain
                showLabel={false}
                label="Mã khách hàng"
                className="w-fit max-w-full [&_button]:text-[15px] [&_button]:normal-case [&_button]:tracking-normal"
              />
            </div>
          ) : (
            <p className="text-xs text-gray-400">—</p>
          )}
        </div>
        <OrderStatusBadge status={order.order_status} plain />
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-gray-500">
        <span className="min-w-0 truncate">
          {paymentLabel}
          <span className="mx-1 text-gray-300">·</span>
          {order.createdAt ? formatDate(order.createdAt, 'datetime') : '—'}
        </span>
        <span className="shrink-0 font-bold text-brand-dark tabular-nums">
          {formatCurrency(order.order_checkout?.totalCheckout ?? 0)}
        </span>
      </div>
    </ProductListCardNav>
  );
}

/**
 * Hàng desktop trong bảng.
 *
 * @param {{ order: object, rowIndex?: number }} props
 */
export function OrderListRow({ order, rowIndex = 0 }) {
  const id = String(order._id);
  const detailHref = `/orders/${id}`;
  const statusKey = getOrderStatusKey(order);
  const customerId = getOrderCustomerId(order);
  const tracking = order.order_trackingNumber;
  const paymentLabel = getOrderPaymentLabel(order, { short: true });

  return (
    <ProductListCardNav
      as="tr"
      href={detailHref}
      className={cn(
        getAdminListRowZebraClass(rowIndex),
        ADMIN_LIST_ROW_HOVER_CLASS,
        STATUS_ROW_ACCENT[statusKey] ?? STATUS_ROW_ACCENT.pending,
      )}
    >
      <td className={cn(ORDER_TABLE_CELL_BASE, ORDER_TABLE_COL.tracking)}>
        {tracking ? (
          <div data-card-nav-block className="min-w-0">
            <ProductIdCopy
              id={tracking}
              plain
              showLabel={false}
              label="Mã đơn hàng"
              className="w-fit max-w-full"
            />
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className={cn(ORDER_TABLE_CELL_BASE, ORDER_TABLE_COL.customer, ORDER_TABLE_DIVIDER, 'text-left')}>
        <p className="truncate text-xs font-semibold text-brand-dark">
          {getOrderCustomerName(order)}
        </p>
      </td>
      <td className={cn(ORDER_TABLE_CELL_BASE, ORDER_TABLE_COL.customerId, ORDER_TABLE_DIVIDER, 'text-center')}>
        {customerId && customerId !== '—' ? (
          <div data-card-nav-block className="flex justify-center">
            <ProductIdCopy
              id={customerId}
              plain
              showLabel={false}
              label="Mã khách hàng"
              className="w-fit max-w-full [&_button]:text-[15px] [&_button]:normal-case [&_button]:tracking-normal"
            />
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className={cn(ORDER_TABLE_CELL_BASE, ORDER_TABLE_COL.total, ORDER_TABLE_DIVIDER, 'text-center')}>
        <span className="text-xs font-bold tabular-nums whitespace-nowrap text-brand-dark">
          {formatCurrency(order.order_checkout?.totalCheckout ?? 0)}
        </span>
      </td>
      <td className={cn(ORDER_TABLE_CELL_BASE, ORDER_TABLE_COL.payment, ORDER_TABLE_DIVIDER, 'text-center')}>
        <span className="text-xs font-semibold whitespace-nowrap text-brand-dark" title={getOrderPaymentLabel(order)}>
          {paymentLabel}
        </span>
      </td>
      <td className={cn(ORDER_TABLE_CELL_BASE, ORDER_TABLE_COL.status, ORDER_TABLE_DIVIDER, 'text-center')}>
        <OrderStatusBadge
          status={order.order_status}
          plain
          className="justify-center"
        />
      </td>
      <td className={cn(ORDER_TABLE_CELL_BASE, ORDER_TABLE_COL.created, ORDER_TABLE_DIVIDER, 'text-center')}>
        <span className="text-xs font-semibold text-brand-dark tabular-nums whitespace-nowrap">
          {order.createdAt ? formatDate(order.createdAt, 'datetime') : '—'}
        </span>
      </td>
    </ProductListCardNav>
  );
}
