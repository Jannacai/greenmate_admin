import ListPagination from '@/components/common/ListPagination';
import OrderListCard, { OrderListRow } from '@/components/orders/OrderListCard';
import {
  ORDER_LIST_TABLE_CLASS,
  ORDER_TABLE_COL,
  ORDER_TABLE_DIVIDER,
  ORDER_TABLE_HEAD_BASE,
} from '@/components/orders/orderListTableStyles';
import { cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

/**
 * @param {{
 *   orders: Array<object>,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   querySuffix?: string,
 * }} props
 */
export default function OrderListTable({
  orders = [],
  total = 0,
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  querySuffix = '',
}) {
  if (!orders.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-brand-dark">Chưa có đơn hàng</h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Đơn từ storefront sẽ hiển thị tại đây sau khi khách đặt hàng thành công.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {orders.map((order) => (
          <OrderListCard key={order._id} order={order} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={ORDER_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(ORDER_TABLE_HEAD_BASE, ORDER_TABLE_COL.tracking, 'text-center')}>
                  Mã đơn
                </th>
                <th className={cn(ORDER_TABLE_HEAD_BASE, ORDER_TABLE_COL.customer, ORDER_TABLE_DIVIDER, 'text-left')}>
                  Khách hàng
                </th>
                <th className={cn(ORDER_TABLE_HEAD_BASE, ORDER_TABLE_COL.customerId, ORDER_TABLE_DIVIDER, 'text-center')}>
                  Mã khách hàng
                </th>
                <th className={cn(ORDER_TABLE_HEAD_BASE, ORDER_TABLE_COL.total, ORDER_TABLE_DIVIDER, 'text-center')}>
                  Tổng tiền
                </th>
                <th className={cn(ORDER_TABLE_HEAD_BASE, ORDER_TABLE_COL.payment, ORDER_TABLE_DIVIDER, 'text-center')}>
                  Thanh toán
                </th>
                <th className={cn(ORDER_TABLE_HEAD_BASE, ORDER_TABLE_COL.status, ORDER_TABLE_DIVIDER, 'text-center')}>
                  Trạng thái
                </th>
                <th className={cn(ORDER_TABLE_HEAD_BASE, ORDER_TABLE_COL.created, ORDER_TABLE_DIVIDER, 'text-center')}>
                  Ngày đặt
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <OrderListRow key={order._id} order={order} rowIndex={index} />
              ))}
            </tbody>
          </table>
        </div>

        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="đơn hàng"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white md:hidden">
        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="đơn hàng"
        />
      </div>
    </div>
  );
}
