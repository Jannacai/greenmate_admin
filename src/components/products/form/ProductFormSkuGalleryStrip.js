'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import SkuMediaVideoThumb from '@/components/products/preview/SkuMediaVideoThumb';
import { countSkuGalleryMediaItems } from '@/lib/products/productPreview';
import { cn } from '@/lib/shared/utils';

const THUMB_SIZES = '64px';

/**
 * Cột thumbnail dọc — video (đầu list) + ảnh SKU trên form sản phẩm.
 *
 * @param {{
 *   images?: string[],
 *   videoUrl?: string | null,
 *   activeIndex?: number,
 *   onActiveIndexChange?: (index: number) => void,
 *   reorderable?: boolean,
 *   onReorder?: (images: string[]) => void,
 *   onImageZoom?: (src: string, index: number) => void,
 *   className?: string,
 * }} props
 */
export default function ProductFormSkuGalleryStrip({
  images = [],
  videoUrl = null,
  activeIndex = 0,
  onActiveIndexChange,
  reorderable = false,
  onReorder,
  onImageZoom,
  className,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const videoOffset = videoUrl ? 1 : 0;
  const mediaCount = countSkuGalleryMediaItems(videoUrl, images);

  function reorderImages(from, to) {
    if (!reorderable || !onReorder || from == null || to == null || from === to) return;

    const fromImg = from - videoOffset;
    const toImg = to - videoOffset;
    if (fromImg < 0 || toImg < 0) return;

    const next = [...images];
    const [moved] = next.splice(fromImg, 1);
    next.splice(toImg, 0, moved);
    onReorder(next);

    const activeUrl = images[fromImg];
    const nextImgIndex = next.indexOf(activeUrl);
    if (nextImgIndex >= 0) {
      onActiveIndexChange?.(nextImgIndex + videoOffset);
    }
  }

  function clearDragState() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className={cn('flex w-[68px] shrink-0 flex-col', className)}>
      <p className="mb-1 text-[10px] font-semibold leading-tight text-brand-dark">
        Thư viện ảnh
      </p>
      {reorderable && images.length > 1 && (
        <p className="mb-1.5 text-[9px] leading-tight text-gray-400">Kéo để sắp xếp</p>
      )}
      {onImageZoom && mediaCount > 0 && (
        <p className="mb-1.5 text-[9px] leading-tight text-gray-400">Nhấp đổi media · Nhấn đúp phóng to ảnh</p>
      )}

      {!mediaCount ? (
        <p className="text-[10px] leading-snug text-gray-400">Chưa có ảnh</p>
      ) : (
        <div
          className="flex max-h-[min(400px,55vh)] flex-col gap-2 overflow-y-auto pr-0.5"
          role="tablist"
          aria-label="Media biến thể"
        >
          {videoUrl && (
            <SkuMediaVideoThumb
              videoUrl={videoUrl}
              isActive={activeIndex === 0}
              onClick={() => onActiveIndexChange?.(0)}
            />
          )}

          {images.map((src, index) => {
            const mediaIndex = index + videoOffset;
            const isActive = mediaIndex === activeIndex;
            const canDrag = reorderable && images.length > 1;

            return (
              <div
                key={`${src}-${index}`}
                draggable={canDrag}
                onDragStart={(e) => {
                  if (!canDrag) return;
                  setDragIndex(mediaIndex);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', String(mediaIndex));
                }}
                onDragOver={(e) => {
                  if (!canDrag) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (overIndex !== mediaIndex) setOverIndex(mediaIndex);
                }}
                onDragLeave={() => {
                  if (overIndex === mediaIndex) setOverIndex(null);
                }}
                onDrop={(e) => {
                  if (!canDrag) return;
                  e.preventDefault();
                  const from = dragIndex ?? Number(e.dataTransfer.getData('text/plain'));
                  reorderImages(from, mediaIndex);
                  clearDragState();
                }}
                onDragEnd={clearDragState}
                className={cn(
                  'relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-lg border bg-gray-50 transition-shadow',
                  canDrag && 'cursor-grab active:cursor-grabbing',
                  isActive
                    ? 'border-brand-primary ring-2 ring-brand-primary/30'
                    : 'border-gray-200 hover:border-brand-primary/50',
                  dragIndex === mediaIndex && 'opacity-50',
                  overIndex === mediaIndex && dragIndex !== mediaIndex && 'ring-2 ring-brand-primary ring-offset-1',
                )}
              >
                {canDrag && (
                  <span
                    className="pointer-events-none absolute top-0.5 left-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded bg-brand-primary px-0.5 text-[9px] font-bold leading-none text-white shadow"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                )}
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Ảnh ${index + 1}`}
                  onClick={() => onActiveIndexChange?.(mediaIndex)}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    onImageZoom?.(src, index);
                  }}
                  className={cn('block h-full w-full', onImageZoom && 'cursor-zoom-in')}
                >
                  <OptimizedImage
                    src={src}
                    alt=""
                    preset="thumb"
                    sizes={THUMB_SIZES}
                    width={68}
                    height={91}
                    className="h-full w-full object-cover"
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
