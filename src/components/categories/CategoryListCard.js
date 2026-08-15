'use client';

import Link from 'next/link';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import CategoryStatusBadge from '@/components/categories/CategoryStatusBadge';
import CategoryRowActions from '@/components/categories/CategoryRowActions';
import { getCategoryStorefrontPath, getProductTypeLabel } from '@/lib/categories/categoryDisplay';
import { cn } from '@/lib/shared/utils';
import {
  CATEGORY_TABLE_CELL_BASE,
  CATEGORY_TABLE_COL,
  CATEGORY_TABLE_DIVIDER,
} from '@/components/categories/categoryListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

/**
 * Loại sản phẩm chưa có trang chi tiết — click mở form sửa.
 *
 * @param {{
 *   category: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   desktopVariant?: 'card' | 'row',
 *   rowIndex?: number,
 * }} props
 */
export function CategoryListCard({
  category,
  canUpdate = false,
  canDelete = false,
  desktopVariant = 'card',
  rowIndex = 0,
}) {
  const id = String(category._id);
  const path = getCategoryStorefrontPath(category);
  const editHref = `/categories/${id}/edit`;

  if (desktopVariant === 'row') {
    return (
      <ProductListCardNav
        as="tr"
        href={editHref}
        className={cn(
          getAdminListRowZebraClass(rowIndex),
          ADMIN_LIST_ROW_HOVER_CLASS,
        )}
      >
        <td className={cn(CATEGORY_TABLE_CELL_BASE, CATEGORY_TABLE_COL.name)}>
          <Link
            href={editHref}
            className="text-xs font-medium text-brand-dark line-clamp-2 hover:text-brand-primary hover:underline"
          >
            {category.category_name}
          </Link>
        </td>
        <td className={cn(CATEGORY_TABLE_CELL_BASE, CATEGORY_TABLE_COL.group, CATEGORY_TABLE_DIVIDER, 'text-center text-xs text-gray-600')}>
          {getProductTypeLabel(category.category_product_type)}
        </td>
        <td className={cn(CATEGORY_TABLE_CELL_BASE, CATEGORY_TABLE_COL.status, CATEGORY_TABLE_DIVIDER, 'text-center')}>
          <CategoryStatusBadge category={category} plain />
        </td>
        <td className={cn(CATEGORY_TABLE_CELL_BASE, CATEGORY_TABLE_COL.storefront, CATEGORY_TABLE_DIVIDER, 'text-center font-mono text-[11px] text-gray-500 truncate')}>
          {path || '—'}
        </td>
        <td className={cn(CATEGORY_TABLE_CELL_BASE, CATEGORY_TABLE_COL.actions, CATEGORY_TABLE_DIVIDER, 'text-right')}>
          <CategoryRowActions
            categoryId={id}
            category={category}
            canUpdate={canUpdate}
            canDelete={canDelete}
            compact
          />
        </td>
      </ProductListCardNav>
    );
  }

  return (
    <ProductListCardNav
      href={editHref}
      className="rounded-lg border border-gray-200 bg-white p-3 space-y-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={editHref}
            className="font-semibold text-sm text-brand-dark hover:text-brand-primary"
          >
            {category.category_name}
          </Link>
          <p className="mt-0.5 text-xs text-gray-500">{getProductTypeLabel(category.category_product_type)}</p>
        </div>
        <CategoryStatusBadge category={category} plain />
      </div>
      {path && (
        <p className="text-[11px] font-mono text-gray-400 truncate">{path}</p>
      )}
      <div className="flex justify-end border-t border-gray-100 pt-2.5">
        <CategoryRowActions
          categoryId={id}
          category={category}
          canUpdate={canUpdate}
          canDelete={canDelete}
          compact
        />
      </div>
    </ProductListCardNav>
  );
}
