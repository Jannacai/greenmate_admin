'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import VoucherScopePagination from '@/components/vouchers/VoucherScopePagination';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import {
  buildProductScopeRow,
  groupSkuItemsByProduct,
} from '@/lib/vouchers/voucherDisplay';
import { cn, stringifyMongoId } from '@/lib/shared/utils';
import {
  scopeProductCopyValue,
  scopeSkuCopyValue,
  scopeProductCopyLabel,
  scopeSkuCopyLabel,
  getRowSkuPriceLines,
} from '@/components/vouchers/voucherScopeListHelpers';
import {
  CompactScopeRow,
  DesktopTableRow,
  ExpandedSkuList,
  IdCopy,
  ScopeProductName,
  ScopeProductThumb,
  SerialBadge,
  SkuPriceLines,
  VariantToggle,
} from '@/components/vouchers/VoucherScopeListParts';

const SEARCH_DEBOUNCE_MS = 400;

/**
 * Danh sách SP áp dụng voucher — phân trang server (API scope-products).
 */
export default function VoucherScopeItemList({
  mode,
  productItems = [],
  skuItems = [],
  missingProductIds = [],
  missingSkuIds = [],
  minOrder = 0,
  compact = false,
  discount = null,
  page = 1,
  limit = 10,
  total = 0,
  initialSearch = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const startIndex = (page - 1) * limit;

  const productRows = useMemo(() => {
    const loaded = productItems.map((product) => buildProductScopeRow(product));

    const missing = missingProductIds.map((id) => ({
      key: id,
      productId: id,
      productName: 'Chưa tải tên sản phẩm',
      thumb: '',
      price: '—',
      skuPriceLines: [],
      variantCount: 0,
      variants: [],
      missing: true,
    }));

    return [...loaded, ...missing];
  }, [productItems, missingProductIds]);

  const skuGroups = useMemo(() => {
    const groups = groupSkuItemsByProduct(skuItems).map((group) => {
      const sourceProduct = skuItems.find(
        (item) => stringifyMongoId(item.product?._id) === group.productId,
      )?.product;
      return {
        key: group.productId,
        productId: group.productId,
        productCode: group.productCode,
        productName: group.productName,
        thumb: group.thumb,
        price: group.priceSummary,
        variantCount: group.variantCount,
        variants: group.variants,
        missing: false,
        isDraft: sourceProduct?._scopeProductStatus === 'draft',
        isRemoved: sourceProduct?._scopeRemoved === true
          || sourceProduct?._scopeProductStatus === 'removed',
      };
    });

    const orphanSkus = missingSkuIds.map((skuId) => ({
      key: `orphan-${skuId}`,
      productId: '',
      productName: 'SKU chưa gắn sản phẩm (chưa tải chi tiết)',
      thumb: '',
      price: '—',
      variantCount: 1,
      variants: [{ skuId, skuCode: null, variantLabel: '—', price: '—' }],
      missing: true,
    }));

    return [...groups, ...orphanSkus];
  }, [skuItems, missingSkuIds]);

  const rows = mode === 'products' ? productRows : skuGroups;

  const pushSearchToUrl = useCallback((nextSearch) => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set('scopePage', '1');
    qs.set('scopeLimit', String(limit));
    const trimmed = nextSearch.trim();
    if (trimmed) qs.set('scopeSearch', trimmed);
    else qs.delete('scopeSearch');
    router.replace(`${pathname}?${qs.toString()}`);
  }, [limit, pathname, router, searchParams]);

  const { run: debouncedPushSearch, cancel: cancelDebouncedSearch } = useDebouncedCallback(
    pushSearchToUrl,
    SEARCH_DEBOUNCE_MS,
  );

  function handleSearchChange(value) {
    setSearch(value);
    debouncedPushSearch(value);
  }

  function clearSearch() {
    cancelDebouncedSearch();
    setSearch('');
    pushSearchToUrl('');
  }

  function toggleExpand(productId) {
    if (!productId) return;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  const countLabel = initialSearch
    ? `${total} kết quả`
    : `${total} SP`;

  const showEmptySearch = rows.length === 0 && initialSearch;
  const showCountLabel = !compact;

  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      <div
        className={cn(
          'flex flex-col gap-1.5',
          !compact && 'sm:flex-row sm:items-center sm:justify-between sm:gap-2',
        )}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
      >
        <div className={cn('relative w-full', !compact && 'sm:max-w-xl lg:max-w-2xl')}>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={compact ? 'Tìm tên hoặc mã SP…' : 'Tìm tên, mã sản phẩm hoặc SKU…'}
            autoComplete="off"
            spellCheck={false}
            aria-label="Tìm sản phẩm áp dụng voucher"
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50',
              compact ? 'py-1.5 pl-2.5 pr-8 text-xs' : 'py-2 pl-3 pr-9 text-sm',
            )}
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 py-0.5 text-[10px] font-semibold text-gray-400 hover:text-brand-primary"
              aria-label="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
        {showCountLabel ? (
          <p className="text-[13px] text-gray-500 whitespace-nowrap md:text-[15px]">{countLabel}</p>
        ) : null}
      </div>

      {showEmptySearch ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-brand-gray/30 px-3 py-6 text-center">
          <p className="text-xs text-gray-600">
            Không tìm thấy sản phẩm khớp &quot;{initialSearch}&quot;
          </p>
          <button
            type="button"
            onClick={clearSearch}
            className="mt-2 text-[10px] font-semibold text-brand-primary hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : rows.length === 0 ? null : (
        <>
          <div className={cn('overflow-x-auto rounded-xl border border-gray-200', compact ? 'hidden' : 'hidden md:block')}>
            <table className="gm-voucher-scope-table w-full table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[30%]" />
                <col className="w-[16%]" />
                <col className="w-[22%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="text-[13px] font-bold uppercase tracking-wide text-brand-dark">
                  <th className="px-2 py-3 text-center">STT</th>
                  <th className="px-3 py-3">Sản phẩm</th>
                  <th className="px-3 py-3">Mã sản phẩm</th>
                  <th className="px-3 py-3">Biến thể</th>
                  <th className="px-3 py-3 text-right">Giá gốc</th>
                  <th className="px-3 py-3 text-right text-brand-primary">Sau voucher</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <DesktopTableRow
                    key={row.key}
                    row={row}
                    mode={mode}
                    minOrder={minOrder}
                    discount={discount}
                    serial={startIndex + idx + 1}
                    isExpanded={expandedIds.has(row.productId)}
                    onToggleExpand={() => toggleExpand(row.productId)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <ul
            className={cn(
              compact
                ? 'overflow-hidden rounded-lg border border-gray-200 divide-y divide-gray-100'
                : 'space-y-2 md:hidden',
            )}
          >
            {rows.map((row, idx) => {
              const isExpanded = expandedIds.has(row.productId);
              const hasVariants = row.variantCount > 0;
              const serial = startIndex + idx + 1;

              if (compact) {
                return (
                  <CompactScopeRow
                    key={row.key}
                    row={row}
                    mode={mode}
                    discount={discount}
                    minOrder={minOrder}
                    serial={serial}
                  />
                );
              }

              return (
                <li
                  key={row.key}
                  className={cn(
                    'rounded-xl border p-3',
                    row.missing ? 'border-amber-200 bg-amber-50/40' : 'border-gray-100 bg-brand-gray/20',
                  )}
                >
                  <div className="flex gap-3">
                    <SerialBadge serial={serial} />
                    <ScopeProductThumb row={row} />
                    <div className="min-w-0 flex-1">
                      <ScopeProductName
                        row={row}
                        className="text-sm font-semibold text-brand-dark line-clamp-2"
                      />
                      {row.productId && (
                        <div className="mt-1.5">
                          <IdCopy
                            value={scopeProductCopyValue(row)}
                            label={scopeProductCopyLabel()}
                          />
                        </div>
                      )}
                      <SkuPriceLines
                        lines={getRowSkuPriceLines(row)}
                        discount={discount}
                        minOrder={minOrder}
                      />
                      {hasVariants && row.productId && (
                        <>
                          <div className="mt-2 text-left">
                            <VariantToggle
                              variantCount={row.variantCount}
                              isExpanded={isExpanded}
                              onToggle={() => toggleExpand(row.productId)}
                              inline
                            />
                          </div>
                          {isExpanded && (
                            <div className="mt-2 w-full text-left">
                              <ExpandedSkuList variants={row.variants} compact idsOnly />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {mode === 'skus' && !row.productId && row.variants?.[0] && (
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <IdCopy
                        value={scopeSkuCopyValue(row.variants[0])}
                        label={scopeSkuCopyLabel()}
                        iconFeedback
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <VoucherScopePagination
            page={page}
            limit={limit}
            total={total}
            compact={compact}
          />
        </>
      )}
    </div>
  );
}
