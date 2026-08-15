'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { uploadImageAction } from '@/lib/actions/upload';
import MediaLibraryModal from '@/components/common/MediaLibraryModal';
import ImageLightbox from '@/components/common/ImageLightbox';
import ProductPreviewCard from '@/components/products/preview/ProductPreviewCard';
import { ProductPreviewModeToggle } from '@/components/products/preview/ProductPreviewDeviceFrame';
import ProductFormSkuGalleryStrip from '@/components/products/form/ProductFormSkuGalleryStrip';
import {
  PRODUCT_CARD_IMAGE_RATIO_CLASS,
  PRODUCT_CARD_MAX_WIDTH_CLASS,
} from '@/lib/products/productImages';
import { getStorefrontPreviewFrameClass } from '@/lib/products/productCardPreviewUi';
import {
  findSkuByTier,
  resolveSkuGalleryImages,
  resolveSkuGalleryVideo,
} from '@/lib/products/productPreview';
import { cn } from '@/lib/shared/utils';

/**
 * Preview card cửa hàng + quản lý ảnh đại diện trên form SP.
 * Ảnh mặc định lấy từ ảnh đầu tiên SKU mặc định — không cần chọn thủ công.
 *
 * @param {{
 *   product: object,
 *   thumbUrl: string,
 *   onThumbChange: (url: string) => void,
 *   onThumbClear: () => void,
 *   onSkuImagesReorder?: (tierIdx: number[], images: string[]) => void,
 * }} props
 */
export default function ProductFormStorefrontPreview({
  product,
  thumbUrl,
  onThumbChange,
  onThumbClear,
  onSkuImagesReorder,
}) {
  const inputRef = useRef(null);
  const [isPending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const skus = product.product_skus ?? [];
  const defaultSku = useMemo(
    () => skus.find((s) => s.is_default) ?? skus[0] ?? null,
    [skus],
  );

  const [tierIdx, setTierIdx] = useState(() => {
    const tier = defaultSku?.sku_tier_idx ?? [];
    return (product.product_variations ?? []).map((_, i) => tier[i] ?? 0);
  });
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState('mobile');

  const variationCount = product.product_variations?.length ?? 0;
  const defaultTierKey = (defaultSku?.sku_tier_idx ?? []).join(',');

  useEffect(() => {
    const tier = defaultSku?.sku_tier_idx ?? [];
    setTierIdx(Array.from({ length: variationCount }, (_, i) => tier[i] ?? 0));
  }, [variationCount, defaultTierKey, defaultSku]);

  const selectedSku = useMemo(
    () => findSkuByTier(skus, tierIdx),
    [skus, tierIdx],
  );

  const galleryImages = useMemo(
    () => resolveSkuGalleryImages(selectedSku, thumbUrl || product.product_thumb),
    [selectedSku, thumbUrl, product.product_thumb],
  );

  const galleryVideo = useMemo(
    () => resolveSkuGalleryVideo(selectedSku),
    [selectedSku],
  );

  const skuImages = useMemo(
    () => (selectedSku?.sku_images ?? []).filter(Boolean),
    [selectedSku],
  );

  const canReorderGallery = skuImages.length > 1 && Boolean(onSkuImagesReorder);

  const galleryKey = `${tierIdx.join(',')}-${galleryVideo ?? ''}|${galleryImages.join('|')}`;

  useEffect(() => {
    setGalleryImageIndex(0);
  }, [galleryKey]);

  const displayThumb = thumbUrl || product.product_thumb || '';
  const hasCard = Boolean(displayThumb || defaultSku?.sku_images?.[0] || galleryVideo);

  async function handleFile(file) {
    if (!file) return;

    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(file.type)) {
      setUploadError('Chỉ chấp nhận JPG, PNG, WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ảnh tối đa 5MB');
      return;
    }

    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      if (result.error) {
        setUploadError(result.error);
      } else {
        onThumbChange(result.url);
      }
    });
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function handleClearThumb() {
    setUploadError('');
    onThumbClear();
  }

  if (!hasCard && !isPending) {
    return (
      <div className={cn('mx-auto w-full space-y-2', PRODUCT_CARD_MAX_WIDTH_CLASS)}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full cursor-pointer flex-col items-center justify-center gap-2',
            'rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4',
            PRODUCT_CARD_IMAGE_RATIO_CLASS,
            'hover:border-brand-primary hover:bg-brand-primary/5 transition-colors',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Tải ảnh đại diện</p>
            <p className="mt-0.5 text-[11px] text-gray-400">Hoặc thêm ảnh SKU mặc định</p>
          </div>
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 hover:border-brand-primary hover:text-brand-primary"
          >
            Thư viện
          </button>
        </div>
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleInputChange} />
        <MediaLibraryModal
          open={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          currentUrl={displayThumb}
          onSelect={(url) => {
            setUploadError('');
            onThumbChange(url);
            setLibraryOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex min-w-0 items-start gap-2">
        <div
          className={cn(
            'min-w-0 shrink-0',
            previewMode === 'mobile'
              ? cn('w-[173px] max-w-full', getStorefrontPreviewFrameClass('mobile'))
              : cn('w-[305px] max-w-full', getStorefrontPreviewFrameClass('desktop')),
          )}
        >
          <ProductPreviewCard
            product={product}
            previewMode={previewMode}
            showAdminMeta={false}
            tierIdx={tierIdx}
            onTierIdxChange={setTierIdx}
            galleryImageIndex={galleryImageIndex}
            onMainImageClick={setLightboxSrc}
          />
        </div>

        <ProductFormSkuGalleryStrip
          images={galleryImages}
          videoUrl={galleryVideo}
          activeIndex={galleryImageIndex}
          onActiveIndexChange={setGalleryImageIndex}
          reorderable={canReorderGallery}
          onImageZoom={(src) => setLightboxSrc(src)}
          onReorder={(nextImages) => {
            if (!onSkuImagesReorder) return;
            onSkuImagesReorder(tierIdx, nextImages);
          }}
        />
      </div>

      <ProductPreviewModeToggle
        mode={previewMode}
        onModeChange={setPreviewMode}
        className="justify-end"
      />

      <div className="flex items-center justify-between gap-0.5 rounded-lg border border-gray-200 bg-white px-1 py-1">
        <ThumbAction icon={IconLibrary} label="Thư viện" onClick={() => setLibraryOpen(true)} />
        <ThumbAction icon={IconImage} label="Thay ảnh" onClick={() => inputRef.current?.click()} />
        <ThumbAction icon={IconTrash} label="Xóa" onClick={handleClearThumb} variant="danger" />
      </div>

      {isPending && (
        <p className="text-center text-[11px] text-gray-500">Đang tải ảnh đại diện…</p>
      )}
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleInputChange} />

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        currentUrl={displayThumb}
        onSelect={(url) => {
          setUploadError('');
          onThumbChange(url);
          setLibraryOpen(false);
        }}
      />

      <ImageLightbox
        src={lightboxSrc}
        alt={product.product_name || 'Ảnh sản phẩm'}
        open={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
      />
    </div>
  );
}

function ThumbAction({ icon: Icon, label, onClick, variant = 'default' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-0.5 py-1 transition-colors',
        variant === 'danger'
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-600 hover:bg-gray-100',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="w-full truncate text-center text-[9px] font-medium leading-none">{label}</span>
    </button>
  );
}

function IconImage({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconTrash({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconLibrary({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}
