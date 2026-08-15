'use client';

import { useCallback, useMemo, useState } from 'react';
import ProductPreviewCardGallery from '@/components/products/preview/ProductPreviewCardGallery';
import ProductPreviewSkuList from '@/components/products/preview/ProductPreviewSkuList';
import {
  buildSkuTierLabel,
  findSkuByTier,
  getSkuKey,
  resolveSkuGalleryImages,
  resolveSkuGalleryVideo,
} from '@/lib/products/productPreview';

/**
 * Khu vực preview tương tác — chọn SKU bên phải đồng bộ gallery + card cửa hàng.
 *
 * @param {{ product: object }} props
 */
export default function ProductPreviewWorkspace({ product }) {
  const skus = product.product_skus ?? [];
  const variations = product.product_variations ?? [];

  const defaultSku = useMemo(
    () => skus.find((s) => s.is_default) ?? skus[0] ?? null,
    [skus],
  );

  const [selectedSkuKey, setSelectedSkuKey] = useState(() => getSkuKey(defaultSku));

  const selectedSku = useMemo(
    () => skus.find((s) => getSkuKey(s) === selectedSkuKey) ?? defaultSku,
    [skus, selectedSkuKey, defaultSku],
  );

  const galleryImages = useMemo(
    () => resolveSkuGalleryImages(selectedSku, product.product_thumb),
    [selectedSku, product.product_thumb],
  );

  const galleryVideo = useMemo(
    () => resolveSkuGalleryVideo(selectedSku),
    [selectedSku],
  );

  const skuLabel = useMemo(
    () => buildSkuTierLabel(selectedSku, variations),
    [selectedSku, variations],
  );

  const tierIdx = useMemo(() => {
    const tier = selectedSku?.sku_tier_idx ?? [];
    return variations.map((_, i) => Number(tier[i] ?? 0));
  }, [selectedSku, variations]);

  const handleSelectSku = useCallback((sku) => {
    const key = getSkuKey(sku);
    if (key) setSelectedSkuKey(key);
  }, []);

  const handleTierIdxChange = useCallback((nextTier) => {
    const sku = findSkuByTier(skus, nextTier);
    const key = getSkuKey(sku);
    if (key) setSelectedSkuKey(key);
  }, [skus]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:items-start">
      <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-brand-gray px-4 py-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Card cửa hàng &amp; media sản phẩm
          </h2>
        </div>

        <ProductPreviewCardGallery
          product={product}
          images={galleryImages}
          videoUrl={galleryVideo}
          skuLabel={skuLabel}
          tierIdx={tierIdx}
          onTierIdxChange={handleTierIdxChange}
        />
      </section>

      <aside className="min-w-0 xl:sticky xl:top-4">
        <section className="min-w-0 rounded-xl border border-gray-200 bg-white px-2 py-3 shadow-sm md:px-2.5">
          <h2 className="mb-2 text-sm font-semibold text-brand-dark">
            Tùy Chỉnh Phân Loại
            <span className="ml-2 text-xs font-normal text-gray-400">({skus.length})</span>
          </h2>
          <p className="mb-2 text-xs text-gray-500">
            Chọn biến thể để xem ảnh và video tương ứng.
          </p>
          <ProductPreviewSkuList
            skus={skus}
            variations={variations}
            layout="stack"
            selectable
            selectedSkuKey={selectedSkuKey}
            onSelectSku={handleSelectSku}
          />
        </section>
      </aside>
    </div>
  );
}
