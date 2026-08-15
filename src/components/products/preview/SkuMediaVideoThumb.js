'use client';

import VideoPosterImage from '@/components/common/VideoPosterImage';
import { cn } from '@/lib/shared/utils';

/**
 * Thumbnail video trong cột gallery — icon play ở giữa.
 *
 * @param {{
 *   videoUrl: string,
 *   isActive?: boolean,
 *   onClick?: () => void,
 *   onDoubleClick?: () => void,
 *   className?: string,
 *   aspectClass?: string,
 * }} props
 */
export default function SkuMediaVideoThumb({
  videoUrl,
  isActive = false,
  onClick,
  onDoubleClick,
  className,
  aspectClass = 'aspect-[3/4]',
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label="Video sản phẩm"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'relative w-full shrink-0 overflow-hidden rounded-lg border bg-gray-900 transition-shadow',
        aspectClass,
        isActive
          ? 'border-brand-primary ring-2 ring-brand-primary/30'
          : 'border-gray-200 hover:border-brand-primary/50',
        className,
      )}
    >
      <VideoPosterImage
        videoUrl={videoUrl}
        preset="thumb"
        className="opacity-90"
        alt=""
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-brand-dark shadow">
          <svg className="ml-0.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </span>
      </span>
      <span className="pointer-events-none absolute top-0.5 left-0.5 rounded bg-brand-primary px-1 text-[8px] font-bold uppercase text-white">
        Video
      </span>
    </button>
  );
}
