'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/shared/utils';

/**
 * Mô tả sản phẩm — giới hạn theo chiều cao ô chứa, có nút xem thêm / thu gọn.
 *
 * @param {{ text?: string | null, className?: string, layout?: 'inline' | 'block' }} props
 */
export default function ProductPreviewDescription({ text, className, layout = 'inline' }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const clipRef = useRef(null);
  const textRef = useRef(null);

  const measureOverflow = useCallback(() => {
    if (expanded || !text) {
      return;
    }
    const clip = clipRef.current;
    const content = textRef.current;
    if (!clip || !content) return;
    setCanExpand(content.scrollHeight > clip.clientHeight + 1);
  }, [expanded, text]);

  useEffect(() => {
    measureOverflow();
    window.addEventListener('resize', measureOverflow);
    return () => window.removeEventListener('resize', measureOverflow);
  }, [measureOverflow]);

  useEffect(() => {
    const clip = clipRef.current;
    if (!clip || expanded) return undefined;

    const observer = new ResizeObserver(() => measureOverflow());
    observer.observe(clip);
    return () => observer.disconnect();
  }, [expanded, measureOverflow]);

  if (!text) {
    return <p className={cn('text-sm text-gray-400', className)}>Chưa có mô tả</p>;
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-1', className)}>
      <div
        ref={clipRef}
        className={cn(
          'min-h-0',
          !expanded && layout === 'inline' && 'overflow-hidden max-h-[3.75rem] sm:max-h-none sm:flex-1',
          !expanded && layout === 'block' && 'overflow-hidden max-h-[4.5rem] md:max-h-[5.5rem]',
        )}
      >
        <p
          ref={textRef}
          className="text-sm leading-normal text-gray-600 whitespace-pre-wrap"
        >
          {text}
        </p>
      </div>

      {(canExpand || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="shrink-0 self-start text-xs font-semibold text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary/50 rounded"
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
}
