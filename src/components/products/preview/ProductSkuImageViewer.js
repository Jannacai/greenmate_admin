'use client';

import { useEffect, useState } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import ImageLightbox from '@/components/common/ImageLightbox';
import SkuMediaVideoThumb from '@/components/products/preview/SkuMediaVideoThumb';
import SkuGalleryVideoPlayer from '@/components/products/preview/SkuGalleryVideoPlayer';
import {
  countSkuGalleryMediaItems,
  isSkuGalleryVideoIndex,
} from '@/lib/products/productPreview';
import { cn } from '@/lib/shared/utils';

const THUMB_SIZES = '64px';
const MAIN_SIZES = '(max-width: 1024px) 100vw, 420px';

/**
 * Gallery media theo SKU — video đầu list + ảnh, đồng bộ khung chính.
 *
 * @param {{
 *   images: string[],
 *   videoUrl?: string | null,
 *   skuLabel?: string | null,
 *   emptyMessage?: string,
 *   className?: string,
 *   activeIndex?: number,
 *   onActiveIndexChange?: (index: number) => void,
 * }} props
 */
export default function ProductSkuImageViewer({
  images = [],
  videoUrl = null,
  skuLabel,
  emptyMessage = 'SKU này chưa có ảnh hoặc video',
  className,
  activeIndex: controlledIndex,
  onActiveIndexChange,
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const isControlled = controlledIndex != null;
  const activeIndex = isControlled ? controlledIndex : internalIndex;
  const setActiveIndex = isControlled ? onActiveIndexChange : setInternalIndex;

  const mediaKey = `${videoUrl ?? ''}|${images.join('|')}`;

  useEffect(() => {
    if (!isControlled) {
      setInternalIndex(0);
    }
  }, [mediaKey, isControlled]);

  const showingVideo = isSkuGalleryVideoIndex(activeIndex, videoUrl);
  const imageIndex = videoUrl ? activeIndex - 1 : activeIndex;
  const activeImageSrc = !showingVideo && imageIndex >= 0
    ? (images[imageIndex] ?? images[0] ?? null)
    : null;

  const mediaCount = countSkuGalleryMediaItems(videoUrl, images);

  if (!mediaCount) {
    return (
      <div
        className={cn(
          'flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/60 p-6 text-center',
          className,
        )}
      >
        <div>
          {skuLabel && (
            <p className="mb-1 text-sm font-semibold text-brand-dark">{skuLabel}</p>
          )}
          <p className="text-sm text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('flex min-h-0 gap-3', className)}>
        <div
          className="flex w-[68px] shrink-0 flex-col gap-2 overflow-y-auto pr-0.5"
          role="tablist"
          aria-label="Media biến thể"
        >
          {videoUrl && (
            <SkuMediaVideoThumb
              videoUrl={videoUrl}
              isActive={activeIndex === 0}
              onClick={() => setActiveIndex?.(0)}
            />
          )}

          {images.map((src, index) => {
            const mediaIndex = index + (videoUrl ? 1 : 0);
            const isActive = mediaIndex === activeIndex;

            return (
              <button
                key={`${src}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Ảnh ${index + 1}`}
                onClick={() => setActiveIndex?.(mediaIndex)}
                className={cn(
                  'relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-lg border bg-gray-50 transition-shadow',
                  isActive
                    ? 'border-brand-primary ring-2 ring-brand-primary/30'
                    : 'border-gray-200 hover:border-brand-primary/50',
                )}
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
            );
          })}
        </div>

        <div className="relative min-h-[280px] min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white">
          {showingVideo && videoUrl ? (
            <SkuGalleryVideoPlayer
              src={videoUrl}
              className="h-full min-h-[280px] w-full"
              posterPreset="card"
              active
            />
          ) : (
            <button
              type="button"
              onClick={() => activeImageSrc && setLightboxSrc(activeImageSrc)}
              className="relative block h-full min-h-[280px] w-full cursor-zoom-in hover:ring-2 hover:ring-brand-primary/30 transition-shadow"
              aria-label="Phóng to ảnh đang chọn"
            >
              {activeImageSrc && (
                <OptimizedImage
                  src={activeImageSrc}
                  alt={skuLabel ? `Ảnh ${skuLabel}` : 'Ảnh sản phẩm'}
                  preset="card"
                  sizes={MAIN_SIZES}
                  width={420}
                  height={525}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          )}
        </div>
      </div>

      <ImageLightbox
        src={lightboxSrc}
        alt={skuLabel ? `Ảnh ${skuLabel}` : 'Ảnh sản phẩm'}
        open={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
      />
    </>
  );
}
