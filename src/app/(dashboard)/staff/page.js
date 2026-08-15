import { Suspense } from 'react';
import { getStaffMembers, getStaffStats } from '@/lib/api/staff';
import StaffFilterBar from '@/components/staff/StaffFilterBar';
import StaffListTable from '@/components/staff/StaffListTable';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { parseListLimit, parseListPage, DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import { PageHeader, PageHeaderAction, AdminErrorState, AdminPlusIcon } from '@/components/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Nhân viên',
  robots: { index: false },
};

function buildFilterQuery(params) {
  const qs = new URLSearchParams();
  const keys = ['sort', 'status', 'search', 'createdFrom', 'createdTo', 'roleFilter', 'limit', 'page'];
  for (const key of keys) {
    if (params[key]) qs.set(key, params[key]);
  }
  return qs.toString();
}

function hasExtraStaffFilters(params) {
  return Boolean(
    params.search
    || params.roleFilter
    || params.createdFrom
    || params.createdTo
    || (params.sort && params.sort !== 'ctime'),
  );
}

const PlusIcon = AdminPlusIcon;

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function StaffPage({ searchParams }) {
  const params = await searchParams;
  const permissions = await getCachedMyPermissions();
  const staffCaps = getResourceCapabilities('staff', permissions.grants);
  const limit = parseListLimit(params.limit);
  const page = parseListPage(params.page);

  let listData = { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };
  let statusStats = null;
  let fetchError = null;

  const [listResult, statsResult] = await Promise.allSettled([
    getStaffMembers({
      page,
      limit,
      sort: params.sort,
      status: params.status,
      search: params.search,
      createdFrom: params.createdFrom,
      createdTo: params.createdTo,
      roleFilter: params.roleFilter,
    }),
    getStaffStats(),
  ]);

  if (listResult.status === 'fulfilled') {
    listData = listResult.value;
  } else {
    fetchError = 'Không tải được danh sách nhân viên';
  }

  if (statsResult.status === 'fulfilled') {
    statusStats = statsResult.value;
  }

  const querySuffix = buildFilterQuery(params);
  const extraFilters = hasExtraStaffFilters(params);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader
        title="Nhân viên"
        action={
          staffCaps.canUpdate ? (
            <PageHeaderAction href="/staff/new" icon={PlusIcon} className="self-start">
              Thêm nhân viên
            </PageHeaderAction>
          ) : null
        }
      />

      <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-gray-100" />}>
        <StaffFilterBar
          statusStats={statusStats ?? undefined}
          filteredTotal={listData.total}
          hasActiveFilters={extraFilters}
        />
      </Suspense>

      {fetchError ? (
        <AdminErrorState
          message={fetchError}
          hint={<>Cần quyền <strong>read:any</strong> trên module <strong>staff</strong> trong Phân quyền.</>}
        />
      ) : (
        <StaffListTable
          staffMembers={listData.items}
          total={listData.total}
          page={listData.page}
          limit={listData.limit}
          canUpdate={staffCaps.canUpdate}
          querySuffix={querySuffix}
        />
      )}
    </div>
  );
}
