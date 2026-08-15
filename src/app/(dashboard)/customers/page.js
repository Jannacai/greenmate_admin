import { Suspense } from 'react';
import { getCustomers, getCustomerStats } from '@/lib/api/customer';
import CustomerFilterBar from '@/components/customers/CustomerFilterBar';
import CustomerListTable from '@/components/customers/CustomerListTable';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { parseListLimit, parseListPage, DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import { PageHeader, AdminErrorState } from '@/components/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Khách hàng',
};

function buildFilterQuery(params) {
  const qs = new URLSearchParams();
  const keys = ['sort', 'status', 'search', 'createdFrom', 'createdTo', 'spendingMin', 'spendingMax', 'page', 'limit'];
  for (const key of keys) {
    if (params[key]) qs.set(key, params[key]);
  }
  return qs.toString();
}

function hasExtraCustomerFilters(params) {
  return Boolean(
    params.search
    || params.createdFrom
    || params.createdTo
    || params.spendingMin
    || params.spendingMax
    || (params.sort && params.sort !== 'ctime'),
  );
}

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function CustomersPage({ searchParams }) {
  const params = await searchParams;
  const permissions = await getCachedMyPermissions();
  const customerCaps = getResourceCapabilities('customer', permissions.grants);
  const page = parseListPage(params.page);
  const limit = parseListLimit(params.limit);

  let data = { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };
  let statusStats = null;
  let fetchError = null;

  const [listResult, statsResult] = await Promise.allSettled([
    getCustomers({
      page,
      limit,
      sort: params.sort,
      status: params.status,
      search: params.search,
      createdFrom: params.createdFrom,
      createdTo: params.createdTo,
      spendingMin: params.spendingMin,
      spendingMax: params.spendingMax,
    }),
    getCustomerStats(),
  ]);

  if (listResult.status === 'fulfilled') {
    data = listResult.value;
  } else {
    fetchError = 'Không tải được danh sách khách hàng';
  }

  if (statsResult.status === 'fulfilled') {
    statusStats = statsResult.value;
  }

  const extraFilters = hasExtraCustomerFilters(params);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader title="Khách hàng" />

      <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-gray-100" />}>
        <CustomerFilterBar
          statusStats={statusStats ?? undefined}
          filteredTotal={data.total}
          hasActiveFilters={extraFilters}
        />
      </Suspense>

      {fetchError ? (
        <AdminErrorState
          message={fetchError}
          hint={<>Kiểm tra quyền module <strong>customer</strong> (read:any) và server tipjs đang chạy.</>}
        />
      ) : (
        <CustomerListTable
          customers={data.items}
          total={data.total}
          page={data.page}
          limit={data.limit}
          canUpdate={customerCaps.canUpdate}
          querySuffix={buildFilterQuery(params)}
        />
      )}
    </div>
  );
}
