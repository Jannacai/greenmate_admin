'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  getOptimizedVideoUrl,
  getVideoPosterUrl,
  releaseVideoElement,
} from '@/lib/shared/video';
import { cn } from '@/lib/shared/utils';

/**
 * Player video gallery — autoplay khi active, pause khi unmount / tab ẩn.
 *
 * @param {{
 *   src: string,
 *   className?: string,
 *   objectClass?: string,
 *   posterPreset?: keyof import('@/lib/shared/video').VIDEO_POSTER_PRESETS,
 *   active?: boolean,
 * }} props
 */
export default function SkuGalleryVideoPlayer({
  src,
  className,
  objectClass = 'object-cover',
  posterPreset = 'card',
  active = true,
}) {
  const ref = useRef(null);
  const optimizedSrc = useMemo(() => getOptimizedVideoUrl(src), [src]);
  const poster = useMemo(() => getVideoPosterUrl(src, posterPreset), [src, posterPreset]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !optimizedSrc || !active) return;

    el.currentTime = 0;
    const attempt = el.play();
    if (attempt?.catch) {
      attempt.catch(() => {});
    }
  }, [optimizedSrc, active]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return undefined;

    function onVisibility() {
      if (!el) return;
      if (document.hidden) {
        el.pause();
        return;
      }
      el.play()?.catch(() => {});
    }

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [active]);

  useEffect(() => () => releaseVideoElement(ref.current), []);

  if (!active || !src) return null;

  return (
    <video
      ref={ref}
      src={optimizedSrc}
      poster={poster || undefined}
      className={cn(className, objectClass)}
      controls
      autoPlay
      muted
      playsInline
      preload="metadata"
    />
  );
}
