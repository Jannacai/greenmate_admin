import Link from 'next/link';
import ListPagination from '@/components/common/ListPagination';
import { VoucherListCard } from '@/components/vouchers/VoucherListCard';
import {
  VOUCHER_LIST_TABLE_CLASS,
  VOUCHER_TABLE_COL,
  VOUCHER_TABLE_DIVIDER,
  VOUCHER_TABLE_HEAD_BASE,
} from '@/components/vouchers/voucherListTableStyles';
import { cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

/**
 * @param {{
 *   vouchers: Array<object>,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   canCreate?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   querySuffix?: string,
 * }} props
 */
export default function VoucherListTable({
  vouchers = [],
  total = 0,
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  querySuffix = '',
}) {
  if (!vouchers.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-brand-dark">Chưa có voucher</h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Tạo mã giảm giá đầu tiên — khách nhập mã khi thanh toán trên GreenMate.
          </p>
          {canCreate && (
            <Link
              href="/vouchers/new"
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-brand-primary bg-white px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors"
            >
              Thêm voucher đầu tiên
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {vouchers.map((voucher, index) => (
          <VoucherListCard
            key={voucher._id}
            voucher={voucher}
            canUpdate={canUpdate}
            canDelete={canDelete}
            rowIndex={index}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={VOUCHER_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.code, 'text-center')}>
                  Mã voucher
                </th>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.value, VOUCHER_TABLE_DIVIDER, 'text-center')}>
                  Giá trị
                </th>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.minOrder, VOUCHER_TABLE_DIVIDER, 'text-center')}>
                  Đơn tối thiểu
                </th>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.scope, VOUCHER_TABLE_DIVIDER, 'text-center')}>
                  Phạm vi
                </th>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.start, VOUCHER_TABLE_DIVIDER, 'text-center')}>
                  Bắt đầu
                </th>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.end, VOUCHER_TABLE_DIVIDER, 'text-center')}>
                  Kết thúc
                </th>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.usage, VOUCHER_TABLE_DIVIDER, 'text-center')}>
                  Lượt dùng
                </th>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.status, VOUCHER_TABLE_DIVIDER, 'text-center')}>
                  Trạng thái
                </th>
                <th className={cn(VOUCHER_TABLE_HEAD_BASE, VOUCHER_TABLE_COL.actions, VOUCHER_TABLE_DIVIDER, 'text-center')}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher, index) => (
                <VoucherListCard
                  key={voucher._id}
                  voucher={voucher}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  desktopVariant="row"
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
          itemLabel="voucher"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white md:hidden">
        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="voucher"
        />
      </div>
    </div>
  );
}
