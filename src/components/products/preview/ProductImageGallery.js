'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import ImageLightbox from '@/components/common/ImageLightbox';
import { cn } from '@/lib/shared/utils';

/**
 * Gallery ảnh sản phẩm — click thumbnail để zoom.
 * @param {{ images: string[], variant?: 'compact' | 'grid' }} props
 */
export default function ProductImageGallery({ images, variant = 'compact' }) {
  const [lightboxSrc, setLightboxSrc] = useState(null);

  if (!images?.length) return null;

  const isGrid = variant === 'grid';

  return (
    <>
      <div
        className={cn(
          isGrid
            ? 'grid grid-cols-2 gap-2 sm:grid-cols-3'
            : 'flex flex-wrap gap-2',
        )}
      >
        {images.map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightboxSrc(src)}
            className={cn(
              'relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50 cursor-zoom-in',
              'hover:ring-2 hover:ring-brand-primary/40 transition-shadow',
              isGrid ? 'aspect-square w-full' : 'h-20 w-20',
            )}
            aria-label="Phóng to ảnh"
          >
            <OptimizedImage
              src={src}
              alt=""
              preset="thumb"
              sizes={isGrid ? '(max-width: 768px) 50vw, 160px' : '80px'}
              width={isGrid ? 160 : 80}
              height={isGrid ? 160 : 80}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <ImageLightbox
        src={lightboxSrc}
        alt="Ảnh sản phẩm"
        open={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
      />
    </>
  );
}
