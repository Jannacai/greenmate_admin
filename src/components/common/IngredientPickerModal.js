'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { searchIngredientsForPickerAction } from '@/lib/actions/ingredient';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import { cn } from '@/lib/shared/utils';

/**
 * Modal chọn nguyên liệu từ kho — tìm kiếm server.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSelect: (option: { id: string, name: string, unit: string, stockLabel: string }) => void,
 *   excludeIds?: string[],
 *   title?: string,
 * }} props
 */
export default function IngredientPickerModal({
  open,
  onClose,
  onSelect,
  excludeIds = [],
  title = 'Chọn nguyên liệu',
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [ready, setReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    setSearch('');
    setLoadError('');
    setReady(false);

    startTransition(async () => {
      const res = await searchIngredientsForPickerAction({ search: '', limit: 20 });
      if (res?.error) {
        setLoadError(res.error);
        setResults([]);
      } else {
        setLoadError('');
        setResults(res.items ?? []);
      }
      setReady(true);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await searchIngredientsForPickerAction({
          search,
          limit: 20,
        });
        if (res?.error) {
          setLoadError(res.error);
          setResults([]);
        } else {
          setLoadError('');
          setResults(res.items ?? []);
        }
        setReady(true);
      });
    }, 320);

    return () => clearTimeout(timer);
  }, [open, search]);

  const excludeSet = useMemo(() => new Set(excludeIds.filter(Boolean)), [excludeIds]);

  const filtered = useMemo(
    () => results.filter((item) => !excludeSet.has(item.id)),
    [results, excludeSet],
  );

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredient-picker-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-4 py-3 md:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="ingredient-picker-title" className="text-sm font-semibold text-brand-dark">
                {title}
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Tìm theo tên hoặc mã nguyên liệu — không cần nhập ID thủ công
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand-dark"
              aria-label="Đóng"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên hoặc mã nguyên liệu…"
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-dark outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            autoFocus
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2 md:p-3">
          {loadError && (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{loadError}</p>
          )}

          {!ready ? (
            <p className="px-2 py-8 text-center text-sm text-gray-400">Đang tải kho nguyên liệu…</p>
          ) : !filtered.length ? (
            <div className="px-2 py-8 text-center">
              <p className="text-sm text-gray-500">
                {search.trim()
                  ? 'Không tìm thấy nguyên liệu phù hợp'
                  : 'Chưa có nguyên liệu trong kho'}
              </p>
              <Link
                href="/inventory/new"
                className="mt-3 inline-block text-xs font-medium text-brand-primary hover:underline"
                onClick={onClose}
              >
                + Nhập kho nguyên liệu mới
              </Link>
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((item) => (
                <li key={item.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(item);
                      }
                    }}
                    className={cn(
                      'cursor-pointer rounded-lg border border-transparent px-3 py-2.5 text-left',
                      'hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-brand-primary/30',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-dark">
                        {item.name}
                      </p>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium tabular-nums text-brand-dark">{item.stockLabel}</p>
                        {item.unit && !String(item.stockLabel).toLowerCase().includes(item.unit.toLowerCase()) && (
                          <p className="text-[10px] text-gray-400">{item.unit}</p>
                        )}
                      </div>
                    </div>
                    <div
                      className="mt-1.5"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <ProductIdCopy
                        id={item.id}
                        size="picker"
                        showLabel
                        variant="compact"
                        label="Mã nguyên liệu"
                        className="w-full"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {isPending && ready && filtered.length > 0 && (
            <p className="py-2 text-center text-[10px] text-gray-400">Đang tải…</p>
          )}
        </div>

        <div className="border-t border-gray-100 px-4 py-3 text-center">
          <Link
            href="/inventory"
            className="text-xs font-medium text-brand-primary hover:underline"
            onClick={onClose}
          >
            Quản lý kho nguyên liệu
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
