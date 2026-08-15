import { Suspense } from 'react';
import { getOrders, getOrderStats } from '@/lib/api/order';
import OrderFilterBar from '@/components/orders/OrderFilterBar';
import OrderListTable from '@/components/orders/OrderListTable';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { parseListLimit, parseListPage, DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import { PageHeader, AdminErrorState, LiveDataRefresh } from '@/components/admin';

export const metadata = {
  title: 'Đơn hàng',
};

export const dynamic = 'force-dynamic';

function buildFilterQuery(params) {
  const qs = new URLSearchParams();
  const keys = ['status', 'search', 'sort', 'page', 'limit'];
  for (const key of keys) {
    if (params[key]) qs.set(key, params[key]);
  }
  return qs.toString();
}

function hasExtraOrderFilters(params) {
  return Boolean(params.search || (params.sort && params.sort !== 'ctime'));
}

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function OrdersPage({ searchParams }) {
  const params = await searchParams;
  await getCachedMyPermissions();

  const page = parseListPage(params.page);
  const limit = parseListLimit(params.limit);

  let data = { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };
  let statusStats = null;
  let fetchError = null;

  const status = params.status || 'pending';

  try {
    const [listData, statsData] = await Promise.all([
      getOrders({
        page,
        limit,
        status,
        search: params.search,
        sort: params.sort ?? 'ctime',
      }),
      getOrderStats(),
    ]);
    data = listData;
    statusStats = statsData;
  } catch (err) {
    fetchError = err?.message ?? 'Không tải được danh sách đơn hàng';
  }

  const querySuffix = buildFilterQuery({ ...params, status });
  const extraFilters = hasExtraOrderFilters(params);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader
        title="Đơn hàng"
        action={<LiveDataRefresh intervalMs={15000} />}
      />

      <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-gray-100" />}>
        <OrderFilterBar
          statusStats={statusStats ?? undefined}
          filteredTotal={data.total}
          hasActiveFilters={extraFilters}
        />
      </Suspense>

      {fetchError ? (
        <AdminErrorState
          message={fetchError}
          hint={<>Kiểm tra quyền module <strong>order</strong> (read:any) và server tipjs đang chạy.</>}
        />
      ) : (
        <OrderListTable
          orders={data.items}
          total={data.total}
          page={data.page}
          limit={data.limit}
          querySuffix={querySuffix}
        />
      )}
    </div>
  );
}
