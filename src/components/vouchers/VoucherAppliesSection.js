'use client';

import { Suspense } from 'react';
import VoucherScopeItemList from '@/components/vouchers/VoucherScopeItemList';
import {
  getAppliesToConfig,
  getVoucherScopeShortLabelFromDiscount,
  resolveVoucherScopeProductCount,
} from '@/lib/vouchers/voucherDisplay';
import { formatCurrency, cn } from '@/lib/shared/utils';

/**
 * Danh sách sản phẩm / SKU thuộc phạm vi voucher.
 *
 * @param {{
 *   scope: ReturnType<import('@/lib/vouchers/voucherScopeFromApi').mapDiscountScopeApiToDisplay>,
 *   layout?: 'default' | 'sidebar',
 *   discount?: object | null,
 * }} props
 */
export default function VoucherAppliesSection({ scope, layout = 'default', discount = null }) {
  const applies = getAppliesToConfig(scope.appliesTo);
  const minOrder = scope.minOrder ?? 0;
  const isSidebar = layout === 'sidebar';

  const title = scope.isAllShop ? 'Phạm vi áp dụng' : 'Sản phẩm áp dụng';

  const productCount = scope.isAllShop
    ? 0
    : discount
      ? resolveVoucherScopeProductCount(discount)
      : scope.appliesTo === 'specific_sku'
        ? scope.total
        : scope.targetCount ?? 0;

  const scopeSummaryText = scope.isAllShop
    ? applies.label
    : discount
      ? getVoucherScopeShortLabelFromDiscount(discount)
      : productCount > 0
        ? `${productCount} sản phẩm`
        : 'Sản phẩm cụ thể';

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
        isSidebar && 'flex max-h-[calc(100vh-6rem)] flex-col lg:min-h-0',
      )}
    >
      <div
        className={cn(
          'shrink-0 border-b border-gray-100 bg-brand-gray/50 px-4 py-3',
          isSidebar && 'px-4 py-2.5',
        )}
      >
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h3 className="shrink-0 text-sm font-bold text-brand-dark">{title}</h3>
          <p
            className={cn(
              'min-w-0 truncate text-xs font-medium',
              scope.isAllShop ? 'text-gray-500' : 'text-violet-700',
              !isSidebar && 'text-sm',
            )}
          >
            {scopeSummaryText}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'px-4 py-4',
          isSidebar && 'flex-1 overflow-y-auto overscroll-contain px-3 py-3',
        )}
      >
        {scope.isAllShop && (
          <div
            className={cn(
              'flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50',
              isSidebar ? 'p-3' : 'p-4',
            )}
          >
            <ScopeIconAll
              className={cn(
                'shrink-0 text-slate-600',
                isSidebar ? 'h-7 w-7' : 'h-9 w-9',
              )}
            />
            <div>
              <p className="text-sm font-bold text-brand-dark">Toàn bộ sản phẩm shop</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Mã áp dụng cho mọi sản phẩm đang bán
                {minOrder > 0 ? `, đơn từ ${formatCurrency(minOrder)}` : ''}.
              </p>
            </div>
          </div>
        )}

        {!scope.isAllShop && scope.appliesTo === 'specific' && (
          <>
            {scope.productItems.length > 0 || (scope.missingProductIds?.length ?? 0) > 0 || scope.total > 0 ? (
              <Suspense fallback={<ScopeListSkeleton compact={isSidebar} />}>
                <VoucherScopeItemList
                  mode="products"
                  productItems={scope.productItems}
                  missingProductIds={scope.missingProductIds ?? []}
                  minOrder={minOrder}
                  compact={isSidebar}
                  discount={discount}
                  page={scope.page}
                  limit={scope.limit}
                  total={scope.total}
                  initialSearch={scope.scopeSearch ?? ''}
                />
              </Suspense>
            ) : (
              <EmptyScopeMessage
                message={`Voucher gắn ${scope.targetCount ?? 0} sản phẩm — không tải được danh sách chi tiết.`}
              />
            )}
          </>
        )}

        {!scope.isAllShop && scope.appliesTo === 'specific_sku' && (
          <>
            {scope.skuItems.length > 0 || (scope.missingSkuIds?.length ?? 0) > 0 || scope.total > 0 ? (
              <Suspense fallback={<ScopeListSkeleton compact={isSidebar} />}>
                <VoucherScopeItemList
                  mode="skus"
                  skuItems={scope.skuItems}
                  missingSkuIds={scope.missingSkuIds ?? []}
                  minOrder={minOrder}
                  compact={isSidebar}
                  discount={discount}
                  page={scope.page}
                  limit={scope.limit}
                  total={scope.total}
                  initialSearch={scope.scopeSearch ?? ''}
                />
              </Suspense>
            ) : (
              <EmptyScopeMessage
                message={`Voucher gắn ${productCount} sản phẩm — không tải được danh sách chi tiết.`}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}

/** @param {{ message: string }} props */
function EmptyScopeMessage({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-brand-gray/30 px-4 py-6 text-center">
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

/** @param {{ compact?: boolean }} props */
function ScopeListSkeleton({ compact }) {
  return (
    <div className={cn('space-y-2', compact && 'space-y-1')}>
      <div className={cn('rounded-lg bg-gray-100 animate-pulse', compact ? 'h-8' : 'h-10')} />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn('rounded-lg bg-gray-100 animate-pulse', compact ? 'h-16' : 'h-24')}
        />
      ))}
    </div>
  );
}

function ScopeIconAll({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.75m-.75 0v-7.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21m-9-3h6.75" />
    </svg>
  );
}
