import Link from 'next/link';
import { CategoryListCard } from '@/components/categories/CategoryListCard';
import {
  CATEGORY_LIST_TABLE_CLASS,
  CATEGORY_TABLE_COL,
  CATEGORY_TABLE_DIVIDER,
  CATEGORY_TABLE_HEAD_BASE,
} from '@/components/categories/categoryListTableStyles';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{
 *   categories: Array<object>,
 *   canCreate?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 * }} props
 */
export default function CategoryListTable({
  categories = [],
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) {
  if (!categories.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <h2 className="text-sm font-semibold text-brand-dark">Chưa có loại sản phẩm</h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Thêm danh mục con như Hạt điều, Óc chó để hiển thị trên menu storefront.
          </p>
          {canCreate && (
            <Link
              href="/categories/new"
              className="mt-3 inline-flex rounded-md border border-brand-primary px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/5"
            >
              Thêm loại đầu tiên
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {categories.map((category, index) => (
          <CategoryListCard
            key={String(category._id)}
            category={category}
            canUpdate={canUpdate}
            canDelete={canDelete}
            rowIndex={index}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={CATEGORY_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(CATEGORY_TABLE_HEAD_BASE, CATEGORY_TABLE_COL.name, 'text-center')}>Tên</th>
                <th className={cn(CATEGORY_TABLE_HEAD_BASE, CATEGORY_TABLE_COL.group, CATEGORY_TABLE_DIVIDER, 'text-center')}>Thuộc nhóm</th>
                <th className={cn(CATEGORY_TABLE_HEAD_BASE, CATEGORY_TABLE_COL.status, CATEGORY_TABLE_DIVIDER, 'text-center')}>Trạng thái</th>
                <th className={cn(CATEGORY_TABLE_HEAD_BASE, CATEGORY_TABLE_COL.storefront, CATEGORY_TABLE_DIVIDER, 'text-center')}>Storefront</th>
                <th className={cn(CATEGORY_TABLE_HEAD_BASE, CATEGORY_TABLE_COL.actions, CATEGORY_TABLE_DIVIDER, 'text-center')}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <CategoryListCard
                  key={String(category._id)}
                  category={category}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  desktopVariant="row"
                  rowIndex={index}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
