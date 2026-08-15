import Link from 'next/link';
import ListPagination from '@/components/common/ListPagination';
import { CollectionListCard } from '@/components/collections/CollectionListCard';
import {
  COLLECTION_LIST_TABLE_CLASS,
  COLLECTION_TABLE_COL,
  COLLECTION_TABLE_DIVIDER,
  COLLECTION_TABLE_HEAD_BASE,
} from '@/components/collections/collectionListTableStyles';
import { cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

/**
 * @param {{
 *   collections: Array<object>,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   canCreate?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   querySuffix?: string,
 * }} props
 */
export default function CollectionListTable({
  collections = [],
  total = 0,
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  querySuffix = '',
}) {
  if (!collections.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 9.878z" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-brand-dark">Chưa có bộ sưu tập</h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Gom sản phẩm theo campaign — banner hero có thể trỏ link tới trang bộ sưu tập.
          </p>
          {canCreate && (
            <Link
              href="/collections/new"
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-brand-primary bg-white px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors"
            >
              Tạo bộ sưu tập đầu tiên
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {collections.map((collection, index) => (
          <CollectionListCard
            key={collection._id}
            collection={collection}
            canUpdate={canUpdate}
            canDelete={canDelete}
            rowIndex={index}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={COLLECTION_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(COLLECTION_TABLE_HEAD_BASE, COLLECTION_TABLE_COL.name, 'text-center')}>
                  Bộ sưu tập
                </th>
                <th className={cn(COLLECTION_TABLE_HEAD_BASE, COLLECTION_TABLE_COL.products, COLLECTION_TABLE_DIVIDER, 'text-center')}>
                  SP
                </th>
                <th className={cn(COLLECTION_TABLE_HEAD_BASE, COLLECTION_TABLE_COL.pill, COLLECTION_TABLE_DIVIDER, 'text-center')}>
                  Trạng thái
                </th>
                <th className={cn(COLLECTION_TABLE_HEAD_BASE, COLLECTION_TABLE_COL.url, COLLECTION_TABLE_DIVIDER, 'text-center')}>
                  URL FE
                </th>
                <th className={cn(COLLECTION_TABLE_HEAD_BASE, COLLECTION_TABLE_COL.actions, COLLECTION_TABLE_DIVIDER, 'text-center')}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection, index) => (
                <CollectionListCard
                  key={collection._id}
                  collection={collection}
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
          itemLabel="bộ sưu tập"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white md:hidden">
        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="bộ sưu tập"
        />
      </div>
    </div>
  );
}
