'use client';

import { useEffect, useState } from 'react';
import ProductPreviewDeviceFrame, { ProductPreviewModeToggle } from '@/components/products/preview/ProductPreviewDeviceFrame';
import ProductSkuImageViewer from '@/components/products/preview/ProductSkuImageViewer';
import { countSkuGalleryMediaItems } from '@/lib/products/productPreview';

/**
 * Khu vực preview card + thư viện media theo SKU — video đầu list, đồng bộ card.
 *
 * @param {{
 *   product: object,
 *   images: string[],
 *   videoUrl?: string | null,
 *   skuLabel?: string | null,
 *   tierIdx?: number[],
 *   onTierIdxChange?: (tierIdx: number[]) => void,
 * }} props
 */
export default function ProductPreviewCardGallery({
  product,
  images,
  videoUrl,
  skuLabel,
  tierIdx,
  onTierIdxChange,
}) {
  const [mode, setMode] = useState('mobile');
  const [mediaIndex, setMediaIndex] = useState(0);

  const mediaKey = `${videoUrl ?? ''}|${images.join('|')}`;

  useEffect(() => {
    setMediaIndex(0);
  }, [mediaKey]);

  const mediaCount = countSkuGalleryMediaItems(videoUrl, images);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(305px,360px)_minmax(0,1fr)] lg:items-start">
      <ProductPreviewDeviceFrame
        product={product}
        embedded
        mode={mode}
        tierIdx={tierIdx}
        onTierIdxChange={onTierIdxChange}
        showAdminMeta={false}
        galleryImageIndex={mediaIndex}
      />

      <div className="min-w-0 rounded-xl border border-gray-100 bg-brand-gray/30 p-3">
        <h3 className="mb-3 text-sm font-semibold text-brand-dark">
          Thư viện ảnh
          {skuLabel && (
            <span className="ml-1.5 font-normal text-gray-500">· {skuLabel}</span>
          )}
          <span className="ml-2 text-xs font-normal text-gray-400">({mediaCount})</span>
        </h3>

        <ProductSkuImageViewer
          images={images}
          videoUrl={videoUrl}
          skuLabel={skuLabel}
          activeIndex={mediaIndex}
          onActiveIndexChange={setMediaIndex}
        />

        <ProductPreviewModeToggle
          mode={mode}
          onModeChange={setMode}
          className="mt-3 justify-end"
        />
      </div>
    </div>
  );
}
