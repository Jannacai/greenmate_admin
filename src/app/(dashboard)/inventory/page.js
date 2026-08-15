import { Suspense } from 'react';
import { getIngredients, getIngredientStats } from '@/lib/api/ingredient';
import IngredientFilterBar from '@/components/inventory/IngredientFilterBar';
import IngredientListTable from '@/components/inventory/IngredientListTable';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { parseListLimit, parseListPage, DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import { PageHeader, PageHeaderAction, AdminErrorState, AdminPlusIcon } from '@/components/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tồn kho nguyên liệu',
  robots: { index: false },
};

function buildFilterQuery(params) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.location) qs.set('location', params.location);
  if (params.stock) qs.set('stock', params.stock);
  if (params.limit) qs.set('limit', params.limit);
  if (params.page) qs.set('page', params.page);
  return qs.toString();
}

function hasExtraIngredientFilters(params) {
  return Boolean(params.search || params.location);
}

const PlusIcon = AdminPlusIcon;

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function InventoryPage({ searchParams }) {
  const params = await searchParams;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('ingredient', permissions.grants);
  const limit = parseListLimit(params.limit);
  const page = parseListPage(params.page);

  let listData = { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };
  let stockStats = null;
  let fetchError = null;

  const [listResult, statsResult] = await Promise.allSettled([
    getIngredients({
      page,
      limit,
      search: params.search,
      location: params.location,
      stock: params.stock,
    }),
    getIngredientStats(),
  ]);

  if (listResult.status === 'fulfilled') {
    listData = listResult.value;
  } else {
    fetchError = 'Không tải được danh sách nguyên liệu';
  }

  if (statsResult.status === 'fulfilled') {
    stockStats = statsResult.value;
  }

  const querySuffix = buildFilterQuery(params);
  const extraFilters = hasExtraIngredientFilters(params);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader
        title="Tồn kho nguyên liệu"
        action={
          caps.canCreate ? (
            <PageHeaderAction href="/inventory/new" icon={PlusIcon} className="self-start">
              Nhập kho
            </PageHeaderAction>
          ) : null
        }
      />

      <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-gray-100" />}>
        <IngredientFilterBar
          stockStats={stockStats ?? undefined}
          filteredTotal={listData.total}
          hasActiveFilters={extraFilters}
        />
      </Suspense>

      {fetchError ? (
        <AdminErrorState
          message={fetchError}
          hint={<>Cần quyền <strong>read:any</strong> trên module <strong>ingredient</strong> và server tipjs đang chạy.</>}
        />
      ) : (
        <IngredientListTable
          ingredients={listData.items}
          total={listData.total}
          page={listData.page}
          limit={listData.limit}
          canCreate={caps.canCreate}
          canUpdate={caps.canUpdate}
          canDelete={caps.canDelete}
          querySuffix={querySuffix}
        />
      )}
    </div>
  );
}
