import { Suspense } from 'react';
import { getCollections, getCollectionStats } from '@/lib/api/collection';
import CollectionFilterBar from '@/components/collections/CollectionFilterBar';
import CollectionListTable from '@/components/collections/CollectionListTable';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { parseListLimit, parseListPage, DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import { PageHeader, PageHeaderAction, AdminErrorState, AdminPlusIcon } from '@/components/admin';

export const metadata = {
  title: 'Bộ sưu tập',
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

function hasExtraCollectionFilters(params) {
  return Boolean(params.search || (params.sort && params.sort !== 'ctime'));
}

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function CollectionsPage({ searchParams }) {
  const params = await searchParams;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('collection', permissions.grants);
  const page = parseListPage(params.page);
  const limit = parseListLimit(params.limit);

  let data = { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };
  let statusStats = null;
  let fetchError = null;

  try {
    const [listData, statsData] = await Promise.all([
      getCollections({
        page,
        limit,
        status: params.status,
        search: params.search,
        sort: params.sort ?? 'ctime',
      }),
      getCollectionStats(),
    ]);
    data = listData;
    statusStats = statsData;
  } catch (err) {
    fetchError = err?.message ?? 'Không tải được danh sách bộ sưu tập';
  }

  const querySuffix = buildFilterQuery(params);
  const extraFilters = hasExtraCollectionFilters(params);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader
        title="Bộ sưu tập"
        action={
          caps.canCreate ? (
            <PageHeaderAction href="/collections/new" icon={AdminPlusIcon}>
              Tạo bộ sưu tập
            </PageHeaderAction>
          ) : null
        }
      />

      <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-gray-100" />}>
        <CollectionFilterBar
          statusStats={statusStats ?? undefined}
          filteredTotal={data.total}
          hasActiveFilters={extraFilters}
        />
      </Suspense>

      {fetchError ? (
        <AdminErrorState
          message={fetchError}
          hint={<>Kiểm tra quyền module <strong>collection</strong> (read:any) và server tipjs đang chạy.</>}
        />
      ) : (
        <CollectionListTable
          collections={data.items}
          total={data.total}
          page={data.page}
          limit={data.limit}
          canCreate={caps.canCreate}
          canUpdate={caps.canUpdate}
          canDelete={caps.canDelete}
          querySuffix={querySuffix}
        />
      )}
    </div>
  );
}
