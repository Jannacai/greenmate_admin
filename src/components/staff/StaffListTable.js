import Link from 'next/link';
import ListPagination from '@/components/common/ListPagination';
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import StaffListCard from '@/components/staff/StaffListCard';
import StaffRowActions from '@/components/staff/StaffRowActions';
import StaffRoleBadge from '@/components/staff/StaffRoleBadge';
import { formatDate, cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import {
  STAFF_LIST_TABLE_CLASS,
  STAFF_TABLE_CELL_BASE,
  STAFF_TABLE_COL,
  STAFF_TABLE_DIVIDER,
  STAFF_TABLE_HEAD_BASE,
} from '@/components/staff/staffListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

/**
 * @param {{
 *   staffMembers: Array<object>,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   canUpdate?: boolean,
 *   querySuffix?: string,
 * }} props
 */
export default function StaffListTable({
  staffMembers = [],
  total = 0,
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  canUpdate = false,
  querySuffix = '',
}) {
  if (!staffMembers.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-brand-dark">Không tìm thấy nhân viên</h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Thử đổi bộ lọc hoặc thêm nhân viên mới.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {staffMembers.map((member) => (
          <StaffListCard key={member.user_id} member={member} canUpdate={canUpdate} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={STAFF_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(STAFF_TABLE_HEAD_BASE, STAFF_TABLE_COL.code, 'text-center')}>
                  Mã nhân viên
                </th>
                <th className={cn(STAFF_TABLE_HEAD_BASE, STAFF_TABLE_COL.staff, STAFF_TABLE_DIVIDER, 'text-center')}>
                  Nhân viên
                </th>
                <th className={cn(STAFF_TABLE_HEAD_BASE, STAFF_TABLE_COL.role, STAFF_TABLE_DIVIDER, 'text-center')}>
                  Vai trò
                </th>
                <th className={cn(STAFF_TABLE_HEAD_BASE, STAFF_TABLE_COL.lastLogin, STAFF_TABLE_DIVIDER, 'text-center')}>
                  Đăng nhập cuối
                </th>
                <th className={cn(STAFF_TABLE_HEAD_BASE, STAFF_TABLE_COL.created, STAFF_TABLE_DIVIDER, 'text-center')}>
                  Ngày tạo
                </th>
                <th className={cn(STAFF_TABLE_HEAD_BASE, STAFF_TABLE_COL.status, STAFF_TABLE_DIVIDER, 'text-center')}>
                  Trạng thái
                </th>
                <th className={cn(STAFF_TABLE_HEAD_BASE, STAFF_TABLE_COL.actions, STAFF_TABLE_DIVIDER, 'text-center')}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((member, index) => (
                <StaffTableRow
                  key={member.user_id}
                  member={member}
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
          itemLabel="nhân viên"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white md:hidden">
        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="nhân viên"
        />
      </div>
    </div>
  );
}

/** @param {{ member: object, canUpdate?: boolean, rowIndex?: number }} props */
function StaffTableRow({ member, canUpdate, rowIndex = 0 }) {
  const detailHref = `/staff/${member.user_id}`;

  return (
    <ProductListCardNav
      as="tr"
      href={detailHref}
      className={cn(
        getAdminListRowZebraClass(rowIndex),
        ADMIN_LIST_ROW_HOVER_CLASS,
      )}
    >
      <td className={cn(STAFF_TABLE_CELL_BASE, STAFF_TABLE_COL.code, 'text-center')}>
        {member.user_id ? (
          <div data-card-nav-block className="flex justify-center">
            <ProductIdCopy
              id={member.user_id}
              plain
              showLabel={false}
              label="Mã nhân viên"
              className="w-fit max-w-full [&_button]:text-[15px] [&_button]:normal-case [&_button]:tracking-normal"
            />
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className={cn(STAFF_TABLE_CELL_BASE, STAFF_TABLE_COL.staff, STAFF_TABLE_DIVIDER, 'min-w-0')}>
        <Link
          href={detailHref}
          className="block truncate text-xs font-semibold text-brand-dark hover:text-brand-primary hover:underline"
        >
          {member.user_name}
        </Link>
      </td>
      <td className={cn(STAFF_TABLE_CELL_BASE, STAFF_TABLE_COL.role, STAFF_TABLE_DIVIDER, 'text-center')}>
        <StaffRoleBadge
          roleType={member.user_role?.role_type}
          roleName={member.user_role?.role_name}
        />
      </td>
      <td
        className={cn(
          STAFF_TABLE_CELL_BASE,
          STAFF_TABLE_COL.lastLogin,
          STAFF_TABLE_DIVIDER,
          'text-center text-xs text-gray-500 whitespace-nowrap',
        )}
      >
        {member.lastLoginAt ? formatDate(member.lastLoginAt, 'datetime') : '—'}
      </td>
      <td
        className={cn(
          STAFF_TABLE_CELL_BASE,
          STAFF_TABLE_COL.created,
          STAFF_TABLE_DIVIDER,
          'text-center text-xs text-gray-500 whitespace-nowrap',
        )}
      >
        {member.createdAt ? formatDate(member.createdAt, 'datetime') : '—'}
      </td>
      <td className={cn(STAFF_TABLE_CELL_BASE, STAFF_TABLE_COL.status, STAFF_TABLE_DIVIDER, 'text-center')}>
        <CustomerStatusBadge status={member.user_status} plain />
      </td>
      <td className={cn(STAFF_TABLE_CELL_BASE, STAFF_TABLE_COL.actions, STAFF_TABLE_DIVIDER)}>
        <StaffRowActions userId={member.user_id} status={member.user_status} canUpdate={canUpdate} compact />
      </td>
    </ProductListCardNav>
  );
}
