import Link from 'next/link';
import ListPagination from '@/components/common/ListPagination';
import ProductListCard from '@/components/products/list/ProductListCard';
import {
  PRODUCT_LIST_TABLE_CLASS,
  PRODUCT_TABLE_COL,
  PRODUCT_TABLE_DIVIDER,
  PRODUCT_TABLE_HEAD_BASE,
} from '@/components/products/list/productListTableStyles';
import { cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

/**
 * @param {{
 *   products: Array<object>,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   hasActiveFilters?: boolean,
 *   catalogStats?: { total?: number, published?: number, draft?: number },
 *   canCreate?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   querySuffix?: string,
 * }} props
 */
export default function ProductListTable({
  products = [],
  total = 0,
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  hasActiveFilters = false,
  catalogStats = { total: 0, published: 0, draft: 0 },
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  querySuffix = '',
}) {
  if (!products.length) {
    const isEmptyCatalog = !catalogStats.total && !hasActiveFilters;

    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-brand-dark">
            {isEmptyCatalog ? 'Chưa có sản phẩm' : 'Không tìm thấy sản phẩm'}
          </h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            {isEmptyCatalog
              ? 'Thêm sản phẩm đầu tiên — điền thông tin, phân loại và SKU biến thể.'
              : 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm phía trên.'}
          </p>
          {isEmptyCatalog && canCreate && (
            <Link
              href="/products/new"
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-brand-primary bg-white px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors"
            >
              Thêm sản phẩm đầu tiên
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile — card rời */}
      <div className="space-y-2 md:hidden">
        {products.map((product) => (
          <ProductListCard
            key={String(product._id)}
            product={product}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        ))}
      </div>

      {/* Desktop — table + pagination gộp một khối */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={PRODUCT_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(PRODUCT_TABLE_HEAD_BASE, PRODUCT_TABLE_COL.product, 'text-center')}>
                  Sản phẩm
                </th>
                <th
                  className={cn(
                    PRODUCT_TABLE_HEAD_BASE,
                    PRODUCT_TABLE_COL.productCode,
                    PRODUCT_TABLE_DIVIDER,
                    'text-center',
                  )}
                >
                  Mã sản phẩm
                </th>
                <th
                  className={cn(
                    PRODUCT_TABLE_HEAD_BASE,
                    PRODUCT_TABLE_COL.priceSale,
                    PRODUCT_TABLE_DIVIDER,
                    'text-center',
                  )}
                >
                  Giá KM
                </th>
                <th
                  className={cn(
                    PRODUCT_TABLE_HEAD_BASE,
                    PRODUCT_TABLE_COL.priceBase,
                    PRODUCT_TABLE_DIVIDER,
                    'text-center',
                  )}
                >
                  Giá gốc
                </th>
                <th
                  className={cn(
                    PRODUCT_TABLE_HEAD_BASE,
                    PRODUCT_TABLE_COL.pill,
                    PRODUCT_TABLE_DIVIDER,
                    'text-center',
                  )}
                >
                  Danh mục
                </th>
                <th
                  className={cn(
                    PRODUCT_TABLE_HEAD_BASE,
                    PRODUCT_TABLE_COL.sold,
                    PRODUCT_TABLE_DIVIDER,
                    'text-center',
                  )}
                >
                  Đã bán
                </th>
                <th
                  className={cn(
                    PRODUCT_TABLE_HEAD_BASE,
                    PRODUCT_TABLE_COL.pill,
                    PRODUCT_TABLE_DIVIDER,
                    'text-center',
                  )}
                >
                  Trạng thái
                </th>
                <th
                  className={cn(
                    PRODUCT_TABLE_HEAD_BASE,
                    PRODUCT_TABLE_COL.actions,
                    PRODUCT_TABLE_DIVIDER,
                    'text-center',
                  )}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <ProductListCard
                  key={String(product._id)}
                  product={product}
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
          itemLabel="sản phẩm"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white md:hidden">
        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="sản phẩm"
        />
      </div>
    </div>
  );
}
