'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import {
  getProductPriceDisplay,
  getProductNarrowVoucherLock,
} from '@/lib/vouchers/voucherProductPicker';
import { pickProductCodeFromApi } from '@/lib/products/productDisplay';
import {
  getVoucherPickerProductsByIdsAction,
  searchVoucherPickerProductsAction,
} from '@/lib/actions/product';
import { cn, stringifyMongoId } from '@/lib/shared/utils';
import { showWarning } from '@/lib/shared/toast';

/**
 * Chọn sản phẩm — tìm kiếm server (dùng collection form + voucher form).
 *
 * @param {{
 *   selectedIds: string[],
 *   onChange: (ids: string[]) => void,
 *   disabled?: boolean,
 *   narrowLocksByProduct?: Record<string, { code?: string, applies_to?: string }>,
 *   density?: 'default' | 'compact',
 * }} props
 */
export default function VoucherProductPicker({
  selectedIds = [],
  onChange,
  disabled = false,
  narrowLocksByProduct = {},
  density = 'default',
}) {
  const compact = density === 'compact';
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  /** @type {Record<string, object>} */
  const [pinned, setPinned] = useState({});
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
    if (!selectedIds.length) return;

    startTransition(async () => {
      const res = await getVoucherPickerProductsByIdsAction({ ids: selectedIds });
      if (res?.items?.length) {
        const map = {};
        for (const product of res.items) {
          map[stringifyMongoId(product._id)] = product;
        }
        setPinned((prev) => ({ ...prev, ...map }));
      }
    });
  }, [selectedIds]);

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
    for (const id of selectedIds) {
      if (pinned[id]) map.set(id, pinned[id]);
    }
    for (const product of results) {
      map.set(stringifyMongoId(product._id), product);
    }
    return [...map.values()];
  }, [selectedIds, pinned, results]);

  function toggle(id) {
    if (disabled) return;
    const sid = String(id);
    const lock = getProductNarrowVoucherLock(sid, narrowLocksByProduct);
    if (lock && !selectedIds.includes(sid)) {
      showWarning(
        'Không thể chọn sản phẩm',
        `Sản phẩm đã có voucher "${lock.code}". Mỗi SP chỉ được 1 voucher toàn shop + 1 voucher theo SKU.`,
      );
      return;
    }
    if (selectedIds.includes(sid)) {
      onChange(selectedIds.filter((x) => x !== sid));
    } else {
      onChange([...selectedIds, sid]);
    }
  }

  return (
    <div className={cn('space-y-2', !compact && 'space-y-3')}>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc mã sản phẩm…"
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border border-gray-300 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 sm:max-w-xs',
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
          )}
        />
        <p className="text-xs text-gray-500 whitespace-nowrap">
          Đã chọn <strong className="text-brand-dark">{selectedIds.length}</strong>
          {isPending && <span className="ml-1 text-gray-400">· đang tải…</span>}
        </p>
      </div>

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {loadError}
        </p>
      )}

      {!ready ? (
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse rounded-lg bg-gray-100',
                compact ? 'h-12' : 'h-[72px] rounded-xl',
              )}
            />
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <p
          className={cn(
            'rounded-lg border border-dashed border-gray-200 text-center text-xs text-gray-400',
            compact ? 'py-5' : 'py-8',
          )}
        >
          {search.trim() ? 'Không khớp tìm kiếm' : 'Chưa có sản phẩm trong shop'}
        </p>
      ) : (
        <div
          className={cn(
            'grid grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2',
            compact ? 'max-h-[280px]' : 'max-h-[420px] gap-2',
          )}
        >
          {displayProducts.map((product) => {
            const id = stringifyMongoId(product._id);
            const productCode = pickProductCodeFromApi(product);
            const selected = selectedIds.includes(id);
            const narrowLock = getProductNarrowVoucherLock(id, narrowLocksByProduct);
            const isLocked = Boolean(narrowLock && !selected);
            const thumb = product.product_thumb;
            const isDraft = product.list_status === 'draft' || product._scopeProductStatus === 'draft';
            const thumbSize = compact ? 40 : 56;

            return (
              <button
                key={id}
                type="button"
                disabled={disabled || isLocked}
                onClick={() => toggle(id)}
                className={cn(
                  'flex items-center text-left transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-brand-primary/50',
                  compact
                    ? 'gap-2 rounded-lg border p-1.5 min-h-[48px]'
                    : 'gap-3 rounded-xl border p-2.5 min-h-[72px]',
                  selected
                    ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/30'
                    : isLocked
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-brand-primary/40 hover:bg-brand-gray/40',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded border',
                    compact ? 'h-4 w-4' : 'h-5 w-5',
                    selected ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300 bg-white',
                  )}
                  aria-hidden
                >
                  {selected && (
                    <svg className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>

                <div
                  className={cn(
                    'relative shrink-0 overflow-hidden rounded-md border border-gray-100 bg-brand-gray',
                    compact ? 'h-10 w-10' : 'h-14 w-14 rounded-lg',
                  )}
                >
                  {thumb ? (
                    <OptimizedImage
                      src={thumb}
                      alt={product.product_name}
                      preset="thumb"
                      sizes={`${thumbSize}px`}
                      width={thumbSize}
                      height={thumbSize}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <svg className={compact ? 'h-4 w-4' : 'h-6 w-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {isLocked && narrowLock?.code && (
                    <p className="mb-0.5">
                      <span className="inline-flex rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold text-rose-700 whitespace-nowrap">
                        Đã có {narrowLock.code}
                      </span>
                    </p>
                  )}
                  {compact ? (
                    <>
                      <p className="truncate text-xs font-semibold leading-snug text-brand-dark">
                        {product.product_name}
                        {isDraft && (
                          <span className="ml-1 inline-flex rounded bg-amber-100 px-1 py-px text-[9px] font-semibold text-amber-800">
                            Nháp
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px]">
                        <span
                          className="truncate font-mono text-gray-500"
                          title={productCode ?? undefined}
                        >
                          {productCode ?? '—'}
                        </span>
                        <span className="shrink-0 font-bold text-brand-dark">
                          {getProductPriceDisplay(product)}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-brand-dark line-clamp-2 leading-snug">
                        {product.product_name}
                        {isDraft && (
                          <span className="ml-1 inline-flex rounded bg-amber-100 px-1 py-0.5 text-[9px] font-semibold text-amber-800">
                            Nháp
                          </span>
                        )}
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
                      <p className="mt-0.5 text-xs font-bold text-brand-dark">
                        {getProductPriceDisplay(product)}
                      </p>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
