'use client';

import Link from 'next/link';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import IngredientRowActions from '@/components/inventory/IngredientRowActions';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import { getIngredientListMeta } from '@/lib/ingredients/ingredientDisplay';
import { cn } from '@/lib/shared/utils';

/**
 * Card mobile danh sách nguyên liệu.
 * @param {{ ingredient: object, canUpdate?: boolean, canDelete?: boolean }} props
 */
export default function IngredientListCard({ ingredient, canUpdate = false, canDelete = false }) {
  const meta = getIngredientListMeta(ingredient);
  const stockStatus = meta.stockStatus;
  const detailHref = `/inventory/${meta.id}`;

  return (
    <ProductListCardNav
      href={detailHref}
      className="space-y-2.5 rounded-lg border border-gray-200 bg-white p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={detailHref} className="text-sm font-semibold text-brand-dark hover:underline">
            {meta.name}
          </Link>
          <div className="mt-1" data-card-nav-block>
            <ProductIdCopy id={meta.id} size="sm" label="Mã nguyên liệu" className="max-w-full" />
          </div>
          <p className="mt-1 text-xs font-bold tabular-nums text-brand-dark">{meta.stockLabel}</p>
          <span className={cn('mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold', stockStatus.text)}>
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', stockStatus.dot)} aria-hidden />
            {stockStatus.label}
          </span>
        </div>
        <div className="shrink-0 text-right text-xs text-gray-500">
          <p>{meta.costLabel}</p>
          <p className="mt-1 max-w-[120px] truncate">{meta.location}</p>
        </div>
      </div>
      <IngredientRowActions
        ingredientId={meta.id}
        name={meta.name}
        canUpdate={canUpdate}
        canDelete={canDelete}
        layout="stack"
        compact
      />
    </ProductListCardNav>
  );
}
