'use client';

import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import { cn } from '@/lib/shared/utils';

/**
 * Lightbox zoom ảnh — click thumbnail để xem lớn.
 *
 * @param {{
 *   src: string | null,
 *   alt?: string,
 *   open: boolean,
 *   onClose: () => void,
 * }} props
 */
export default function ImageLightbox({ src, alt = 'Ảnh phóng to', open, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !src || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className={cn(
          'absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center',
          'rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors',
        )}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative max-h-[92vh] max-w-[min(1200px,96vw)] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <OptimizedImage
          src={src}
          alt={alt}
          preset="detail"
          sizes="96vw"
          className="max-h-[92vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>,
    document.body,
  );
}
