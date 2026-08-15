'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import {
  getProductPriceDisplay,
  getSkuDisplayPrice,
  getSkuThumb,
  getSkuVariantLabel,
  productMatchesVoucherPickerSearch,
  getProductNarrowVoucherLock,
} from '@/lib/vouchers/voucherProductPicker';
import {
  getVoucherPickerProductsByIdsAction,
  searchVoucherPickerProductsAction,
} from '@/lib/actions/product';
import { formatCurrency, cn, stringifyMongoId } from '@/lib/shared/utils';
import { pickProductCodeFromApi } from '@/lib/products/productDisplay';
import { showWarning } from '@/lib/shared/toast';

/**
 * Chọn SKU theo sản phẩm — tìm kiếm server.
 *
 * @param {{
 *   selectedSkuIds: string[],
 *   onChange: (ids: string[]) => void,
 *   disabled?: boolean,
 *   narrowLocksByProduct?: Record<string, { code?: string, applies_to?: string }>,
 * }} props
 */
export default function VoucherSkuPicker({
  selectedSkuIds = [],
  onChange,
  disabled = false,
  narrowLocksByProduct = {},
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  /** @type {Record<string, object>} */
  const [pinned, setPinned] = useState({});
  const [expanded, setExpanded] = useState({});
  const [isPending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    startTransition(async () => {
      const res = await searchVoucherPickerProductsAction({ search: '', page: 1, limit: 20 });
      if (res?.error) {
        setLoadError(res.error);
        setResults([]);
      } else {
        setLoadError('');
        setResults(res.items ?? []);
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!selectedSkuIds.length) return;

    startTransition(async () => {
      const res = await getVoucherPickerProductsByIdsAction({ skuIds: selectedSkuIds });
      if (res?.items?.length) {
        const map = {};
        const open = {};
        for (const product of res.items) {
          const pid = stringifyMongoId(product._id);
          map[pid] = product;
          open[pid] = true;
        }
        setPinned((prev) => ({ ...prev, ...map }));
        setExpanded((prev) => ({ ...prev, ...open }));
      }
    });
  }, [selectedSkuIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await searchVoucherPickerProductsAction({
          search,
          page: 1,
          limit: 20,
        });
        if (res?.error) {
          setLoadError(res.error);
          setResults([]);
        } else {
          setLoadError('');
          setResults(res.items ?? []);
        }
      });
    }, 320);

    return () => clearTimeout(timer);
  }, [search]);

  const displayProducts = useMemo(() => {
    const map = new Map();
    for (const product of Object.values(pinned)) {
      map.set(stringifyMongoId(product._id), product);
    }
    for (const product of results) {
      map.set(stringifyMongoId(product._id), product);
    }

    const q = search.trim();
    if (!q) return [...map.values()];

    return [...map.values()].filter((p) => {
      if (productMatchesVoucherPickerSearch(p, q)) return true;
      const qLower = q.toLowerCase();
      return (p.product_skus ?? []).some((sku) => {
        const label = getSkuVariantLabel(sku, p.product_variations).toLowerCase();
        const code = String(sku.sku_code ?? '').toLowerCase();
        return label.includes(qLower) || code.includes(qLower);
      });
    });
  }, [pinned, results, search]);

  function toggleExpand(productId) {
    setExpanded((prev) => ({ ...prev, [productId]: !prev[productId] }));
  }

  function toggleSku(skuId, productId) {
    if (disabled) return;
    const sid = String(skuId);
    const lock = getProductNarrowVoucherLock(productId, narrowLocksByProduct);
    if (lock && !selectedSkuIds.includes(sid)) {
      showWarning(
        'Không thể chọn biến thể',
        `Sản phẩm đã có voucher "${lock.code}". Mỗi SP chỉ được 1 voucher toàn shop + 1 voucher theo SKU.`,
      );
      return;
    }
    if (selectedSkuIds.includes(sid)) {
      onChange(selectedSkuIds.filter((x) => x !== sid));
    } else {
      onChange([...selectedSkuIds, sid]);
    }
  }

  function toggleAllSkusForProduct(product) {
    if (disabled) return;
    const pid = stringifyMongoId(product._id);
    const lock = getProductNarrowVoucherLock(pid, narrowLocksByProduct);
    const skuIds = (product.product_skus ?? [])
      .filter((s) => s.is_active !== false)
      .map((s) => String(s._id));
    const allSelected = skuIds.every((id) => selectedSkuIds.includes(id));
    if (!allSelected && lock) {
      showWarning(
        'Không thể chọn biến thể',
        `Sản phẩm đã có voucher "${lock.code}". Mỗi SP chỉ được 1 voucher toàn shop + 1 voucher theo SKU.`,
      );
      return;
    }
    if (allSelected) {
      onChange(selectedSkuIds.filter((id) => !skuIds.includes(id)));
    } else {
      onChange([...new Set([...selectedSkuIds, ...skuIds])]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, mã SP hoặc biến thể…"
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 sm:max-w-xs"
        />
        <p className="text-xs text-gray-500 whitespace-nowrap">
          Đã chọn <strong className="text-brand-dark">{selectedSkuIds.length}</strong> biến thể
          {isPending && <span className="ml-1 text-gray-400">· đang tải…</span>}
        </p>
      </div>

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {loadError}
        </p>
      )}

      {!ready ? (
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      ) : displayProducts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
          {search.trim() ? 'Không khớp tìm kiếm' : 'Chưa có sản phẩm trong shop'}
        </p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
          {displayProducts.map((product) => {
            const pid = stringifyMongoId(product._id);
            const narrowLock = getProductNarrowVoucherLock(pid, narrowLocksByProduct);
            const isProductLocked = Boolean(narrowLock);
            const isOpen = expanded[pid] ?? false;
            const skus = (product.product_skus ?? []).filter((s) => s.is_active !== false);
            const selectedInProduct = skus.filter((s) =>
              selectedSkuIds.includes(String(s._id)),
            ).length;
            const allInProductSelected =
              skus.length > 0 && selectedInProduct === skus.length;
            const productCode = pickProductCodeFromApi(product);

            return (
              <div key={pid} className="bg-white">
                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(pid)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left rounded-lg hover:bg-brand-gray/50 p-1 -m-1 transition-colors"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-brand-gray">
                      {product.product_thumb ? (
                        <OptimizedImage
                          src={product.product_thumb}
                          alt={product.product_name}
                          preset="thumb"
                          sizes="48px"
                          width={48}
                          height={48}
                          className="h-full w-full"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      {isProductLocked && narrowLock?.code && (
                        <p className="mb-0.5">
                          <span className="inline-flex rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold text-rose-700 whitespace-nowrap">
                            Đã có {narrowLock.code}
                          </span>
                        </p>
                      )}
                      <p className="text-sm font-semibold text-brand-dark truncate">
                        {product.product_name}
                      </p>
                      <div className="mt-0.5 min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Mã SP
                        </span>
                        <p
                          className="truncate font-mono text-xs text-gray-600 select-all"
                          title={productCode ?? undefined}
                        >
                          {productCode ?? '—'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {getProductPriceDisplay(product)}
                        {skus.length > 0 && (
                          <span className="text-gray-400"> · {skus.length} biến thể</span>
                        )}
                      </p>
                      {selectedInProduct > 0 && (
                        <p className="text-[10px] font-semibold text-brand-primary mt-0.5">
                          {selectedInProduct} đã chọn
                        </p>
                      )}
                    </div>
                    <svg
                      className={cn(
                        'h-4 w-4 shrink-0 text-gray-400 transition-transform',
                        isOpen && 'rotate-180',
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {skus.length > 0 && (
                    <button
                      type="button"
                      disabled={disabled || isProductLocked}
                      onClick={() => toggleAllSkusForProduct(product)}
                      className="shrink-0 rounded-lg border border-gray-300 px-2 py-1 text-[10px] font-semibold text-gray-600 hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 whitespace-nowrap"
                    >
                      {allInProductSelected ? 'Bỏ chọn' : 'Chọn hết'}
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-brand-gray/30 px-3 pb-3 pt-2 space-y-1.5">
                    {skus.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2 text-center">
                        Sản phẩm chưa có biến thể SKU
                      </p>
                    ) : (
                      skus.map((sku) => {
                        const skuId = String(sku._id);
                        const selected = selectedSkuIds.includes(skuId);
                        const label = getSkuVariantLabel(sku, product.product_variations);
                        const price = getSkuDisplayPrice(sku);
                        const thumb = getSkuThumb(sku, product);
                        const skuLocked = isProductLocked && !selected;

                        return (
                          <button
                            key={skuId}
                            type="button"
                            disabled={disabled || skuLocked}
                            onClick={() => toggleSku(skuId, pid)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors min-h-[56px]',
                              selected
                                ? 'border-brand-primary bg-white ring-1 ring-brand-primary/25'
                                : skuLocked
                                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                  : 'border-gray-200 bg-white hover:border-brand-primary/35',
                              disabled && 'opacity-50 cursor-not-allowed',
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                selected
                                  ? 'border-brand-primary bg-brand-primary text-white'
                                  : 'border-gray-300 bg-white',
                              )}
                              aria-hidden
                            >
                              {selected && (
                                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>

                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-brand-gray">
                              {thumb ? (
                                <OptimizedImage
                                  src={thumb}
                                  alt={label}
                                  preset="thumb"
                                  sizes="40px"
                                  width={40}
                                  height={40}
                                  className="h-full w-full"
                                />
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-brand-dark truncate">{label}</p>
                              <p className="text-[10px] text-gray-400 font-mono truncate">{sku.sku_code}</p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-xs font-bold text-brand-dark whitespace-nowrap">
                                {formatCurrency(price.current)}
                              </p>
                              {price.onSale && price.original != null && (
                                <p className="text-[10px] text-gray-400 line-through whitespace-nowrap">
                                  {formatCurrency(price.original)}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
