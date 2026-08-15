'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import VideoPosterImage from '@/components/common/VideoPosterImage';
import SkuGalleryVideoPlayer from '@/components/products/preview/SkuGalleryVideoPlayer';
import { getShopVideoLibraryAction } from '@/lib/actions/upload';
import { cn } from '@/lib/shared/utils';

/**
 * Modal chọn video từ thư viện shop — tái sử dụng URL, không upload lại.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSelect: (url: string) => void,
 *   currentUrl?: string,
 *   excludeUrls?: string[],
 * }} props
 */
export default function VideoLibraryModal({
  open,
  onClose,
  onSelect,
  currentUrl,
  excludeUrls = [],
}) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState(null);

  const excluded = new Set(excludeUrls.filter(Boolean));

  useEffect(() => {
    if (!open) return;
    setError('');
    setPreviewUrl(null);
    startTransition(async () => {
      const res = await getShopVideoLibraryAction();
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

  function handleSelect(url) {
    if (excluded.has(url)) return;
    onSelect(url);
    onClose();
  }

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
        aria-label="Thư viện video shop"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-dark">Thư viện video</h3>
            <p className="text-[10px] text-gray-400">
              Chọn video đã có — không tốn thêm dung lượng Cloudinary
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
            <p className="py-8 text-center text-sm text-gray-400">Chưa có video nào trong shop</p>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((url) => {
              const alreadyAdded = excluded.has(url);
              const selected = currentUrl === url;

              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => handleSelect(url)}
                  onDoubleClick={() => setPreviewUrl(url)}
                  disabled={alreadyAdded}
                  className={cn(
                    'relative aspect-video overflow-hidden rounded-lg border-2 bg-gray-900 transition-all',
                    alreadyAdded && 'cursor-not-allowed opacity-50',
                    selected
                      ? 'border-brand-primary ring-2 ring-brand-primary/30'
                      : 'border-gray-100 hover:border-brand-primary/50',
                  )}
                  title={
                    alreadyAdded
                      ? 'Video đang dùng ở SKU khác trong form'
                      : 'Click chọn · Double-click xem trước'
                  }
                >
                  <VideoPosterImage
                    videoUrl={url}
                    preset="library"
                    alt=""
                  />
                  {alreadyAdded && (
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[8px] font-medium text-white">
                      Đang dùng
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {previewUrl && (
        <>
          <div
            className="fixed inset-0 z-[160] bg-black/70"
            onClick={() => setPreviewUrl(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-4 top-[10vh] z-[161] mx-auto max-w-2xl rounded-xl bg-black p-2 shadow-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2">
            <SkuGalleryVideoPlayer
              src={previewUrl}
              className="max-h-[70vh] w-full rounded-lg"
              objectClass="object-contain"
              posterPreset="library"
              active
            />
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="mt-2 w-full rounded-lg bg-white/10 py-2 text-xs font-medium text-white hover:bg-white/20"
            >
              Đóng xem trước
            </button>
          </div>
        </>
      )}
    </>,
    document.body,
  );
}
