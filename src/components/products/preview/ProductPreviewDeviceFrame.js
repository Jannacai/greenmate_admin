'use client';

import { useState } from 'react';
import ProductPreviewCard from '@/components/products/preview/ProductPreviewCard';
import { getStorefrontPreviewFrameClass } from '@/lib/products/productCardPreviewUi';
import { cn } from '@/lib/shared/utils';

const MODES = [
  /** Khớp FE grid 2 cột mobile: calc((100vw - 42px) / 2) ≈ 173px @ 375px */
  { id: 'mobile', label: 'Mobile', width: 'w-[173px] max-w-full shrink-0' },
  /** Khớp FE ProductCard desktop — cố định 305px (không shrink theo cột grid) */
  { id: 'desktop', label: 'Desktop', width: 'w-[305px] max-w-full shrink-0' },
];

/**
 * Nút chuyển Mobile / Desktop cho preview card.
 *
 * @param {{
 *   mode: string,
 *   onModeChange: (mode: string) => void,
 *   className?: string,
 * }} props
 */
export function ProductPreviewModeToggle({ mode, onModeChange, className }) {
  return (
    <div className={cn('flex', className)}>
      <div className="flex rounded-lg border border-gray-200 bg-brand-gray p-0.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onModeChange(m.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              mode === m.id
                ? 'bg-white text-brand-dark shadow-sm ring-1 ring-gray-200'
                : 'text-gray-500 hover:text-brand-primary',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Khung xem trước card cửa hàng — kích thước theo mode (mobile / desktop).
 *
 * @param {{
 *   product: object,
 *   compact?: boolean,
 *   embedded?: boolean,
 *   showAdminMeta?: boolean,
 *   mode?: string,
 *   tierIdx?: number[],
 *   onTierIdxChange?: (tierIdx: number[]) => void,
 *   galleryImageIndex?: number,
 * }} props
 */
export default function ProductPreviewDeviceFrame({
  product,
  compact = false,
  embedded = false,
  showAdminMeta = false,
  mode: modeProp,
  tierIdx,
  onTierIdxChange,
  galleryImageIndex = 0,
}) {
  const [internalMode, setInternalMode] = useState('mobile');
  const mode = modeProp ?? internalMode;
  const active = MODES.find((m) => m.id === mode) ?? MODES[0];
  const isControlled = modeProp != null;

  return (
    <div className="min-w-0">
      {!isControlled && !compact && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            Tương tác như khách trên GreenMate — hover ảnh, chọn biến thể
          </p>
          <ProductPreviewModeToggle mode={mode} onModeChange={setInternalMode} />
        </div>
      )}

      <div
        className={cn(
          embedded
            ? ''
            : compact
              ? 'rounded-xl border border-gray-100 bg-brand-gray/40 p-3'
              : 'flex justify-center rounded-xl bg-brand-gray px-4 py-8 lg:py-10',
        )}
      >
        <div className={cn(
          'transition-[max-width] duration-200',
          embedded && 'mx-auto',
          active.width,
          getStorefrontPreviewFrameClass(mode),
        )}>
          <ProductPreviewCard
            product={product}
            tierIdx={tierIdx}
            onTierIdxChange={onTierIdxChange}
            previewMode={mode}
            showAdminMeta={showAdminMeta}
            compact={compact && !modeProp}
            galleryImageIndex={galleryImageIndex}
          />
        </div>
      </div>
    </div>
  );
}
