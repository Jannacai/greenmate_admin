'use client';

import {
  getOptimizedImageUrl,
  getOptimizedSrcSet,
  getImageSizes,
  PRESET_SRCSET_WIDTHS,
} from '@/lib/shared/image';
import { cn } from '@/lib/shared/utils';

/**
 * Ảnh tối ưu qua Cloudinary CDN trực tiếp (không qua /_next/image).
 * Pattern giống Coolmate: f_auto + q_auto + srcSet theo breakpoint.
 *
 * @param {{
 *   src: string,
 *   alt: string,
 *   preset?: keyof typeof PRESET_SRCSET_WIDTHS,
 *   className?: string,
 *   priority?: boolean,
 *   sizes?: string,
 *   width?: number,
 *   height?: number,
 * }} props
 */
export default function OptimizedImage({
  src,
  alt,
  preset = 'preview',
  className,
  priority = false,
  sizes,
  width,
  height,
}) {
  if (!src) return null;

  const optimizedSrc = getOptimizedImageUrl(src, preset);
  const srcSet = getOptimizedSrcSet(src, PRESET_SRCSET_WIDTHS[preset]);
  const sizesAttr = sizes ?? getImageSizes(preset);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- CDN trực tiếp, nhanh hơn next/image 2-hop
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizesAttr : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={cn('object-cover', className)}
    />
  );
}
