import Link from 'next/link';
import ListPagination from '@/components/common/ListPagination';
import IngredientListCard from '@/components/inventory/IngredientListCard';
import IngredientRowActions from '@/components/inventory/IngredientRowActions';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import { PageHeaderAction } from '@/components/admin';
import { getIngredientListMeta } from '@/lib/ingredients/ingredientDisplay';
import { cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import {
  INGREDIENT_LIST_TABLE_CLASS,
  INGREDIENT_TABLE_CELL_BASE,
  INGREDIENT_TABLE_COL,
  INGREDIENT_TABLE_DIVIDER,
  INGREDIENT_TABLE_HEAD_BASE,
} from '@/components/inventory/ingredientListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

/**
 * @param {{
 *   ingredients: Array<object>,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   canCreate?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   querySuffix?: string,
 * }} props
 */
export default function IngredientListTable({
  ingredients = [],
  total = 0,
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  querySuffix = '',
}) {
  if (!ingredients.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M4 7l2-4h12l2 4M10 11v4m4-4v4" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-brand-dark">Chưa có nguyên liệu</h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Nhập kho lần đầu — hệ thống tự tạo mới hoặc cộng dồn nếu trùng tên.
          </p>
          {canCreate && (
            <PageHeaderAction href="/inventory/new" className="mt-3">
              Nhập kho nguyên liệu
            </PageHeaderAction>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {ingredients.map((item) => (
          <IngredientListCard
            key={String(item._id)}
            ingredient={item}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={INGREDIENT_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(INGREDIENT_TABLE_HEAD_BASE, INGREDIENT_TABLE_COL.name, 'text-center')}>
                  Nguyên liệu
                </th>
                <th className={cn(INGREDIENT_TABLE_HEAD_BASE, INGREDIENT_TABLE_COL.stock, INGREDIENT_TABLE_DIVIDER, 'text-center')}>
                  Tồn kho
                </th>
                <th className={cn(INGREDIENT_TABLE_HEAD_BASE, INGREDIENT_TABLE_COL.cost, INGREDIENT_TABLE_DIVIDER, 'text-center')}>
                  Giá vốn / đv
                </th>
                <th className={cn(INGREDIENT_TABLE_HEAD_BASE, INGREDIENT_TABLE_COL.location, INGREDIENT_TABLE_DIVIDER, 'text-center')}>
                  Vị trí
                </th>
                <th className={cn(INGREDIENT_TABLE_HEAD_BASE, INGREDIENT_TABLE_COL.updated, INGREDIENT_TABLE_DIVIDER, 'text-center')}>
                  Cập nhật
                </th>
                <th className={cn(INGREDIENT_TABLE_HEAD_BASE, INGREDIENT_TABLE_COL.actions, INGREDIENT_TABLE_DIVIDER, 'text-center')}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((item, index) => (
                <IngredientRow
                  key={String(item._id)}
                  ingredient={item}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
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
          itemLabel="nguyên liệu"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white md:hidden">
        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="nguyên liệu"
        />
      </div>
    </div>
  );
}

/** @param {{ ingredient: object, canUpdate?: boolean, canDelete?: boolean, rowIndex?: number }} props */
function IngredientRow({ ingredient, canUpdate, canDelete, rowIndex = 0 }) {
  const meta = getIngredientListMeta(ingredient);
  const stockStatus = meta.stockStatus;
  const detailHref = `/inventory/${meta.id}`;

  return (
    <ProductListCardNav
      as="tr"
      href={detailHref}
      className={cn(
        getAdminListRowZebraClass(rowIndex),
        ADMIN_LIST_ROW_HOVER_CLASS,
      )}
    >
      <td className={cn(INGREDIENT_TABLE_CELL_BASE, INGREDIENT_TABLE_COL.name, 'min-w-0')}>
        <Link
          href={detailHref}
          className="block truncate text-xs font-semibold text-brand-dark hover:text-brand-primary hover:underline"
        >
          {meta.name}
        </Link>
      </td>
      <td className={cn(INGREDIENT_TABLE_CELL_BASE, INGREDIENT_TABLE_COL.stock, INGREDIENT_TABLE_DIVIDER, 'text-center')}>
        <p className="text-xs font-bold tabular-nums text-brand-dark whitespace-nowrap">
          {meta.stockLabel}
          <span className="mx-1 font-normal text-gray-300">·</span>
          <span className={cn('inline-flex items-center gap-1 font-semibold', stockStatus.text)}>
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', stockStatus.dot)} aria-hidden />
            {stockStatus.label}
          </span>
        </p>
      </td>
      <td
        className={cn(
          INGREDIENT_TABLE_CELL_BASE,
          INGREDIENT_TABLE_COL.cost,
          INGREDIENT_TABLE_DIVIDER,
          'text-center text-xs text-gray-600 whitespace-nowrap',
        )}
      >
        {meta.costLabel}
      </td>
      <td
        className={cn(
          INGREDIENT_TABLE_CELL_BASE,
          INGREDIENT_TABLE_COL.location,
          INGREDIENT_TABLE_DIVIDER,
          'text-center text-xs text-gray-600 truncate',
        )}
      >
        {meta.location}
      </td>
      <td
        className={cn(
          INGREDIENT_TABLE_CELL_BASE,
          INGREDIENT_TABLE_COL.updated,
          INGREDIENT_TABLE_DIVIDER,
          'text-center text-xs text-gray-500 whitespace-nowrap',
        )}
      >
        {meta.updatedLabel}
      </td>
      <td className={cn(INGREDIENT_TABLE_CELL_BASE, INGREDIENT_TABLE_COL.actions, INGREDIENT_TABLE_DIVIDER)}>
        <IngredientRowActions
          ingredientId={meta.id}
          name={meta.name}
          canUpdate={canUpdate}
          canDelete={canDelete}
          compact
        />
      </td>
    </ProductListCardNav>
  );
}
