'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePageAutoRefresh } from '@/components/admin/LiveDataRefresh';
import DetailContentTabs from '@/components/users/DetailContentTabs';
import UserDetailSummaryBar from '@/components/users/UserDetailSummaryBar';
import { UserProfileReadOnlySheet } from '@/components/users/UserProfileForm';
import { USER_DETAIL_SHEET_VALUE_CLASS } from '@/components/users/UserDetailSheetTable';
import OrderProductsSheet from '@/components/orders/OrderProductsSheet';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { updateOrderStatusAction } from '@/lib/actions/order';
import {
  getNextOrderStatusOptions,
  getOrderCustomerEmail,
  getOrderCustomerId,
  getOrderCustomerMongoId,
  getOrderCustomerName,
  getOrderCustomerPhone,
  getOrderPaymentLabel,
  getOrderPaymentStatusLabel,
  getOrderShippingSheetRows,
} from '@/lib/orders/orderDisplay';
import { formatCurrency, formatDate, cn } from '@/lib/shared/utils';

const STATUS_BTN =
  'rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap';

/**
 * @param {{ order: object, canUpdate?: boolean }} props
 */
export default function OrderDetailView({ order, canUpdate = false }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  usePageAutoRefresh(15000);
  const nextOptions = getNextOrderStatusOptions(order.order_status);
  const products = order.order_products ?? [];
  const customerMongoId = getOrderCustomerMongoId(order);
  const customerPublicId = getOrderCustomerId(order);
  const customerPhone = getOrderCustomerPhone(order);
  const customerEmail = getOrderCustomerEmail(order);

  function handleStatus(status) {
    startTransition(async () => {
      const res = await updateOrderStatusAction(String(order._id), status);
      if (!res?.error) router.refresh();
    });
  }

  const orderColumn = {
    title: 'Đơn hàng',
    rows: [
      {
        label: 'Mã đơn',
        value: (
          <span className={cn(USER_DETAIL_SHEET_VALUE_CLASS, 'font-mono tabular-nums')}>
            {order.order_trackingNumber ?? '—'}
          </span>
        ),
      },
      {
        label: 'Trạng thái',
        value: <OrderStatusBadge status={order.order_status} />,
      },
      {
        label: 'Ngày đặt',
        value: order.createdAt ? formatDate(order.createdAt, 'datetime') : '—',
      },
      {
        label: 'Cập nhật',
        value: order.updatedAt ? formatDate(order.updatedAt, 'datetime') : '—',
      },
      ...getOrderShippingSheetRows(order).map((row) => ({
        label: row.label,
        value: row.value,
      })),
    ],
  };

  const customerColumn = {
    title: 'Khách hàng',
    rows: [
      {
        label: 'Họ và tên',
        value: getOrderCustomerName(order),
      },
      {
        label: 'Mã KH',
        value:
          customerPublicId !== '—' ? (
            customerMongoId ? (
              <Link
                href={`/customers/${customerMongoId}`}
                className={cn(USER_DETAIL_SHEET_VALUE_CLASS, 'font-mono tabular-nums text-brand-primary hover:underline')}
              >
                {customerPublicId}
              </Link>
            ) : (
              <span className={cn(USER_DETAIL_SHEET_VALUE_CLASS, 'font-mono tabular-nums')}>
                {customerPublicId}
              </span>
            )
          ) : (
            '—'
          ),
      },
      {
        label: 'Email',
        value: customerEmail || '—',
      },
      {
        label: 'Số điện thoại',
        value: customerPhone || '—',
      },
    ],
  };

  const paymentColumn = {
    title: 'Thanh toán',
    rows: [
      {
        label: 'Phương thức',
        value: getOrderPaymentLabel(order),
      },
      {
        label: 'TT thanh toán',
        value: getOrderPaymentStatusLabel(order),
      },
      {
        label: 'Tổng hàng',
        value: formatCurrency(order.order_checkout?.totalOrder ?? 0),
      },
      {
        label: 'Giảm giá',
        value: formatCurrency(order.order_checkout?.totalDiscount ?? 0),
      },
      {
        label: 'Phí ship',
        value: formatCurrency(order.order_checkout?.feeShip ?? 0),
      },
      {
        label: 'Khách trả',
        value: (
          <span className={cn(USER_DETAIL_SHEET_VALUE_CLASS, 'font-semibold')}>
            {formatCurrency(order.order_checkout?.totalCheckout ?? 0)}
          </span>
        ),
      },
    ],
  };

  const statusActions =
    canUpdate && nextOptions.length > 0 ? (
      <>
        {nextOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={isPending}
            onClick={() => handleStatus(option.value)}
            className={cn(
              STATUS_BTN,
              option.value === 'cancelled'
                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                : 'bg-brand-primary text-white hover:bg-brand-primary/90',
            )}
          >
            {option.label}
          </button>
        ))}
      </>
    ) : null;

  const tabs = [
    {
      key: 'overview',
      label: 'Tổng quan',
      content: (
        <UserProfileReadOnlySheet
          columns={[orderColumn, customerColumn, paymentColumn]}
        />
      ),
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      badge: products.length > 0 ? (
        <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-gray-600">
          {products.length}
        </span>
      ) : null,
      content: <OrderProductsSheet products={products} />,
    },
  ];

  return (
    <div className="space-y-3">
      <UserDetailSummaryBar
        name={order.order_trackingNumber || 'Đơn hàng'}
        nameClassName="font-mono"
        badge={<OrderStatusBadge status={order.order_status} />}
        backHref="/orders"
        backLabel="Quay lại danh sách đơn hàng"
        actions={statusActions}
      />

      <DetailContentTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
