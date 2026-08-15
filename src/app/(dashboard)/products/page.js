import { Suspense } from 'react';
import { getAdminProductList } from '@/lib/api/product';
import ProductListTable from '@/components/products/list/ProductListTable';
import ProductFilterBar from '@/components/products/list/ProductFilterBar';
import { PageHeader, AdminErrorState } from '@/components/admin';
import {
  buildProductFilterQuery,
  getDefaultProductListSort,
  hasActiveProductFilters,
  parseProductLimit,
  parseProductPage,
} from '@/lib/products/productListFilter';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sản phẩm',
};

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;

  const permissions = await getCachedMyPermissions();
  const productCaps = getResourceCapabilities('product', permissions.grants);

  const filterParams = {
    status: params.status,
    type: params.type,
    search: params.search,
    voucher: params.voucher,
    voucher_applied: params.voucher_applied,
    sort: params.sort ?? getDefaultProductListSort(params.status),
    page: parseProductPage(params.page),
    limit: parseProductLimit(params.limit),
  };

  let listResult = {
    items: [],
    total: 0,
    page: filterParams.page,
    limit: filterParams.limit,
    stats: { total: 0, published: 0, draft: 0 },
  };
  let fetchError = null;

  try {
    listResult = await getAdminProductList(filterParams);
  } catch {
    fetchError = 'Không tải được danh sách sản phẩm';
  }

  const activeFilters = hasActiveProductFilters(filterParams);
  const querySuffix = buildProductFilterQuery(filterParams);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader title="Sản phẩm" />

      <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-gray-100" />}>
        <ProductFilterBar
          catalogStats={listResult.stats}
          filteredTotal={listResult.total}
          hasActiveFilters={activeFilters}
          canCreate={productCaps.canCreate}
        />
      </Suspense>

      {fetchError ? (
        <AdminErrorState
          message={fetchError}
          hint={(
            <>
              Kiểm tra quyền module <strong>product</strong> (read:any), endpoint{' '}
              <strong>GET /product/shop/list</strong> và server tipjs đang chạy.
            </>
          )}
        />
      ) : (
        <ProductListTable
          products={listResult.items}
          total={listResult.total}
          page={listResult.page}
          limit={listResult.limit}
          hasActiveFilters={activeFilters}
          catalogStats={listResult.stats}
          canCreate={productCaps.canCreate}
          canUpdate={productCaps.canUpdate}
          canDelete={productCaps.canDelete}
          querySuffix={querySuffix}
        />
      )}
    </div>
  );
}
