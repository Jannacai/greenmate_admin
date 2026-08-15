'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import OptimizedImage from '@/components/common/OptimizedImage';
import ImageLightbox from '@/components/common/ImageLightbox';
import { getShopImageLibraryAction } from '@/lib/actions/upload';
import { cn } from '@/lib/shared/utils';

/**
 * Modal chọn ảnh từ thư viện shop — tái sử dụng URL, không upload lại.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSelect?: (url: string) => void,
 *   onSelectMany?: (urls: string[]) => void,
 *   multiple?: boolean,
 *   currentUrl?: string,
 *   excludeUrls?: string[],
 *   onApply?: (changes: { added: string[], removed: string[] }) => void,
 * }} props
 */
export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  onSelectMany,
  multiple = false,
  currentUrl,
  excludeUrls = [],
  onApply,
}) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [picked, setPicked] = useState([]);
  const [unpicked, setUnpicked] = useState([]);

  const excluded = new Set(excludeUrls.filter(Boolean));

  const existingOrder = useMemo(() => {
    const map = new Map();
    excludeUrls.forEach((url, i) => {
      if (url) map.set(url, i + 1);
    });
    return map;
  }, [excludeUrls]);

  useEffect(() => {
    if (!open) return;
    setError('');
    setPicked([]);
    setUnpicked([]);
    startTransition(async () => {
      const res = await getShopImageLibraryAction();
      if (res.error) setError(res.error);
      setItems(res.items ?? []);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleToggle(url) {
    if (excluded.has(url)) {
      if (multiple) {
        setUnpicked((prev) =>
          prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
        );
      }
      return;
    }

    if (!multiple) {
      onSelect?.(url);
      onClose();
      return;
    }

    setPicked((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  }

  function handleConfirmMany() {
    if (!picked.length && !unpicked.length) return;

    if (onApply) {
      onApply({ added: picked, removed: unpicked });
    } else if (picked.length) {
      onSelectMany?.(picked);
    }
    onClose();
  }

  const activeExistingCount = excludeUrls.filter((u) => u && !unpicked.includes(u)).length;
  const pendingCount = picked.length + unpicked.length;

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[150] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-4 top-[8vh] z-[151] mx-auto flex max-h-[84vh] max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:inset-x-auto md:left-1/2 md:w-full md:-translate-x-1/2"
        role="dialog"
        aria-modal="true"
        aria-label="Thư viện ảnh shop"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-dark">Thư viện ảnh</h3>
            <p className="text-[10px] text-gray-400">
              {multiple
                ? 'Đánh dấu ảnh bỏ chọn / chọn thêm · bấm Xác nhận để áp dụng'
                : 'Chọn ảnh đã có — không tốn thêm dung lượng Cloudinary'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isPending && (
            <p className="py-8 text-center text-sm text-gray-400">Đang tải thư viện…</p>
          )}

          {error && !isPending && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          {!isPending && !error && items.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">Chưa có ảnh nào trong shop</p>
          )}

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {items.map((url) => {
              const alreadyAdded = excluded.has(url);
              const markedForRemove = unpicked.includes(url);
              const selected = multiple ? picked.includes(url) : currentUrl === url;
              const pickIndex = picked.indexOf(url);
              const displayOrder = alreadyAdded && !markedForRemove
                ? existingOrder.get(url)
                : pickIndex >= 0
                  ? activeExistingCount + pickIndex + 1
                  : null;

              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => handleToggle(url)}
                  onDoubleClick={() => setPreviewUrl(url)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-lg border-2 bg-gray-50 transition-all',
                    markedForRemove && 'opacity-55 border-dashed border-red-300',
                    !markedForRemove && alreadyAdded && 'cursor-pointer hover:opacity-80',
                    selected && !alreadyAdded
                      ? 'border-brand-primary ring-2 ring-brand-primary/30'
                      : alreadyAdded && !markedForRemove
                        ? 'border-brand-primary/60 ring-1 ring-brand-primary/20'
                        : !markedForRemove && 'border-gray-100 hover:border-brand-primary/50',
                  )}
                  title={
                    alreadyAdded
                      ? markedForRemove
                        ? 'Click hoàn tác · Double-click phóng to'
                        : 'Click đánh dấu bỏ chọn · Double-click phóng to'
                      : multiple
                        ? 'Click chọn/bỏ chọn · Double-click phóng to'
                        : 'Click chọn · Double-click phóng to'
                  }
                >
                  <OptimizedImage
                    src={url}
                    alt=""
                    preset="thumb"
                    sizes="80px"
                    width={80}
                    height={80}
                    className="h-full w-full"
                  />
                  {displayOrder != null && (
                    <span className="absolute top-1 left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white shadow">
                      {displayOrder}
                    </span>
                  )}
                  {alreadyAdded && (
                    <span
                      className={cn(
                        'absolute inset-x-0 bottom-0 py-0.5 text-[8px] font-medium text-white',
                        markedForRemove ? 'bg-red-600/80' : 'bg-black/50',
                      )}
                    >
                      {markedForRemove ? 'Sẽ bỏ' : 'Đã thêm'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {multiple && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              {pendingCount > 0
                ? [
                    picked.length > 0 && `+${picked.length} ảnh mới`,
                    unpicked.length > 0 && `−${unpicked.length} ảnh bỏ`,
                  ].filter(Boolean).join(' · ')
                : 'Chọn / bỏ chọn ảnh rồi bấm Xác nhận'}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300"
              >
                Huỷ
              </button>
              <button
                type="button"
                disabled={pendingCount === 0}
                onClick={handleConfirmMany}
                className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
              >
                Xác nhận{pendingCount > 0 ? ` (${pendingCount})` : ''}
              </button>
            </div>
          </div>
        )}
      </div>

      <ImageLightbox
        src={previewUrl}
        alt="Xem trước thư viện"
        open={Boolean(previewUrl)}
        onClose={() => setPreviewUrl(null)}
      />
    </>,
    document.body,
  );
}
