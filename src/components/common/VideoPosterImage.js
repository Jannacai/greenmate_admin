'use client';

import { getVideoPosterUrl } from '@/lib/shared/video';
import { cn } from '@/lib/shared/utils';

/**
 * Poster frame video — ảnh JPG từ Cloudinary, không request file video.
 *
 * @param {{
 *   videoUrl: string,
 *   preset?: keyof import('@/lib/shared/video').VIDEO_POSTER_PRESETS,
 *   className?: string,
 *   alt?: string,
 *   loading?: 'lazy' | 'eager',
 * }} props
 */
export default function VideoPosterImage({
  videoUrl,
  preset = 'thumb',
  className,
  alt = '',
  loading = 'lazy',
}) {
  const poster = getVideoPosterUrl(videoUrl, preset);

  if (!poster) {
    return (
      <div
        className={cn('h-full w-full bg-gray-800', className)}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={poster}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      loading={loading}
      decoding="async"
      draggable={false}
    />
  );
}
