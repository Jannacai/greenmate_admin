import Link from 'next/link';
import CustomerListCard from '@/components/customers/CustomerListCard';
import CustomerRowActions from '@/components/customers/CustomerRowActions';
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import ListPagination from '@/components/common/ListPagination';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import { formatCurrency, formatDate, cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import {
  CUSTOMER_LIST_TABLE_CLASS,
  CUSTOMER_TABLE_CELL_BASE,
  CUSTOMER_TABLE_COL,
  CUSTOMER_TABLE_DIVIDER,
  CUSTOMER_TABLE_HEAD_BASE,
} from '@/components/customers/customerListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

/**
 * @param {{
 *   customers: Array<object>,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   canUpdate?: boolean,
 *   querySuffix?: string,
 * }} props
 */
export default function CustomerListTable({
  customers = [],
  total = 0,
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  canUpdate = false,
  querySuffix = '',
}) {
  if (!customers.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.25 0 11-5.25 0 2.625 2.25 0 015.25 0z" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-brand-dark">Không tìm thấy khách hàng</h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {customers.map((customer) => (
          <CustomerListCard
            key={customer.user_id ?? customer._id}
            customer={customer}
            canUpdate={canUpdate}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={CUSTOMER_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(CUSTOMER_TABLE_HEAD_BASE, CUSTOMER_TABLE_COL.code, 'text-center')}>
                  Mã khách hàng
                </th>
                <th className={cn(CUSTOMER_TABLE_HEAD_BASE, CUSTOMER_TABLE_COL.customer, CUSTOMER_TABLE_DIVIDER, 'text-center')}>
                  Khách hàng
                </th>
                <th className={cn(CUSTOMER_TABLE_HEAD_BASE, CUSTOMER_TABLE_COL.spent, CUSTOMER_TABLE_DIVIDER, 'text-center')}>
                  Chi tiêu
                </th>
                <th className={cn(CUSTOMER_TABLE_HEAD_BASE, CUSTOMER_TABLE_COL.lastLogin, CUSTOMER_TABLE_DIVIDER, 'text-center')}>
                  Đăng nhập cuối
                </th>
                <th className={cn(CUSTOMER_TABLE_HEAD_BASE, CUSTOMER_TABLE_COL.registered, CUSTOMER_TABLE_DIVIDER, 'text-center')}>
                  Đăng ký
                </th>
                <th className={cn(CUSTOMER_TABLE_HEAD_BASE, CUSTOMER_TABLE_COL.status, CUSTOMER_TABLE_DIVIDER, 'text-center')}>
                  Trạng thái
                </th>
                <th className={cn(CUSTOMER_TABLE_HEAD_BASE, CUSTOMER_TABLE_COL.actions, CUSTOMER_TABLE_DIVIDER, 'text-center')}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <CustomerTableRow
                  key={customer.user_id ?? customer._id}
                  customer={customer}
                  canUpdate={canUpdate}
                  rowIndex={index}
                />
              ))}
            </tbody>
          </table>
        </div>

        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="khách hàng"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white md:hidden">
        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="khách hàng"
        />
      </div>
    </div>
  );
}

/** @param {{ customer: object, canUpdate?: boolean, rowIndex?: number }} props */
function CustomerTableRow({ customer, canUpdate, rowIndex = 0 }) {
  const id = customer.user_id;
  const detailHref = `/customers/${id}`;

  return (
    <ProductListCardNav
      as="tr"
      href={detailHref}
      className={cn(
        getAdminListRowZebraClass(rowIndex),
        ADMIN_LIST_ROW_HOVER_CLASS,
      )}
    >
      <td className={cn(CUSTOMER_TABLE_CELL_BASE, CUSTOMER_TABLE_COL.code, 'text-center')}>
        {id ? (
          <div data-card-nav-block className="flex justify-center">
            <ProductIdCopy
              id={id}
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
      <td className={cn(CUSTOMER_TABLE_CELL_BASE, CUSTOMER_TABLE_COL.customer, CUSTOMER_TABLE_DIVIDER, 'min-w-0')}>
        <Link
          href={detailHref}
          className="block truncate text-xs font-medium text-brand-dark hover:text-brand-primary hover:underline"
        >
          {customer.user_name}
        </Link>
      </td>
      <td
        className={cn(
          CUSTOMER_TABLE_CELL_BASE,
          CUSTOMER_TABLE_COL.spent,
          CUSTOMER_TABLE_DIVIDER,
          'text-center text-xs font-semibold tabular-nums text-brand-dark whitespace-nowrap',
        )}
      >
        {formatCurrency(customer.totalSpent ?? 0)}
        <span className="mx-1 font-normal text-gray-300">·</span>
        <span className="font-normal text-gray-500">{customer.orderCount ?? 0} đơn</span>
      </td>
      <td
        className={cn(
          CUSTOMER_TABLE_CELL_BASE,
          CUSTOMER_TABLE_COL.lastLogin,
          CUSTOMER_TABLE_DIVIDER,
          'text-center text-xs text-gray-500 whitespace-nowrap',
        )}
      >
        {customer.lastLoginAt ? formatDate(customer.lastLoginAt, 'datetime') : '—'}
      </td>
      <td
        className={cn(
          CUSTOMER_TABLE_CELL_BASE,
          CUSTOMER_TABLE_COL.registered,
          CUSTOMER_TABLE_DIVIDER,
          'text-center text-xs text-gray-400 whitespace-nowrap',
        )}
      >
        {customer.createdAt ? formatDate(customer.createdAt, 'datetime') : '—'}
      </td>
      <td className={cn(CUSTOMER_TABLE_CELL_BASE, CUSTOMER_TABLE_COL.status, CUSTOMER_TABLE_DIVIDER, 'text-center')}>
        <CustomerStatusBadge status={customer.user_status} plain />
      </td>
      <td className={cn(CUSTOMER_TABLE_CELL_BASE, CUSTOMER_TABLE_COL.actions, CUSTOMER_TABLE_DIVIDER)}>
        <CustomerRowActions
          userId={id}
          status={customer.user_status}
          canUpdate={canUpdate}
          compact
          hideDetailLink
        />
      </td>
    </ProductListCardNav>
  );
}
