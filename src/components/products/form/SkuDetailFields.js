'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { uploadImageAction } from '@/lib/actions/upload';
import { getIngredientsForPickerByIdsAction } from '@/lib/actions/ingredient';
import OptimizedImage from '@/components/common/OptimizedImage';
import ImageLightbox from '@/components/common/ImageLightbox';
import MediaLibraryModal from '@/components/common/MediaLibraryModal';
import VideoLibraryModal from '@/components/common/VideoLibraryModal';
import VideoPosterImage from '@/components/common/VideoPosterImage';
import IngredientPickerModal from '@/components/common/IngredientPickerModal';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import { cn } from '@/lib/shared/utils';

/**
 * Upload nhiều ảnh cho 1 SKU — thêm từ máy, preview + auto upload.
 * Click thumbnail để phóng to.
 *
 * @param {{ images: string[], onChange: (urls: string[]) => void }} props
 */
export function SkuImageList({ images = [], onChange }) {
  const inputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024;

  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Chỉ chấp nhận JPG, PNG, WebP';
    }
    if (file.size > MAX_SIZE) {
      return 'Ảnh tối đa 5MB';
    }
    return null;
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList ?? []).filter(Boolean);
    if (!files.length || isUploading) return;

    const errors = [];
    const validFiles = [];

    for (const file of files) {
      const err = validateFile(file);
      if (err) errors.push(`${file.name}: ${err}`);
      else validFiles.push(file);
    }

    if (!validFiles.length) {
      setUploadError(errors[0] ?? 'Không có file hợp lệ');
      return;
    }

    setUploadError(errors.length ? errors.join(' · ') : '');
    setIsUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });

    let accumulated = [...images];

    try {
      for (let i = 0; i < validFiles.length; i += 1) {
        const file = validFiles[i];
        setUploadProgress({ current: i + 1, total: validFiles.length });

        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadImageAction(formData);

        if (result.error) {
          errors.push(`${file.name}: ${result.error}`);
          continue;
        }

        accumulated = [...accumulated, result.url];
        onChange(accumulated);
      }

      if (errors.length) {
        setUploadError(errors.join(' · '));
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  function removeAt(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  function reorderImages(from, to) {
    if (from == null || to == null || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  function clearDragState() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div
            key={`${url}-${i}`}
            draggable
            onDragStart={(e) => {
              setDragIndex(i);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(i));
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (overIndex !== i) setOverIndex(i);
            }}
            onDragLeave={() => {
              if (overIndex === i) setOverIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragIndex ?? Number(e.dataTransfer.getData('text/plain'));
              reorderImages(from, i);
              clearDragState();
            }}
            onDragEnd={clearDragState}
            className={cn(
              'group relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-50',
              'cursor-grab active:cursor-grabbing',
              dragIndex === i && 'opacity-50',
              overIndex === i && dragIndex !== i && 'ring-2 ring-brand-primary ring-offset-1',
            )}
          >
            <span
              className="pointer-events-none absolute top-0.5 left-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded bg-brand-primary px-0.5 text-[9px] font-bold leading-none text-white shadow"
              aria-hidden
            >
              {i + 1}
            </span>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setLightboxSrc(url)}
              onKeyDown={(e) => e.key === 'Enter' && setLightboxSrc(url)}
              className="block h-full w-full cursor-zoom-in"
              aria-label={`Phóng to ảnh ${i + 1}`}
            >
              <OptimizedImage
                src={url}
                alt={`SKU ảnh ${i + 1}`}
                preset="thumb"
                sizes="56px"
                width={56}
                height={56}
                className="h-full w-full"
              />
            </div>
            <button
              type="button"
              draggable={false}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); removeAt(i); }}
              className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Xóa ảnh"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={isUploading}
          onClick={() => setLibraryOpen(true)}
          className="flex h-14 w-14 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
          title="Chọn từ thư viện shop"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <span className="mt-0.5 text-[9px]">Thư viện</span>
        </button>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex h-14 w-14 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {uploadProgress && (
                <span className="mt-0.5 text-[9px] font-medium text-brand-primary">
                  {uploadProgress.current}/{uploadProgress.total}
                </span>
              )}
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="mt-0.5 text-[9px]">Thêm</span>
            </>
          )}
        </button>
      </div>

      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
      <p className="text-[10px] text-gray-400">
        Kéo thả để đổi thứ tự · Click ảnh phóng to · Ảnh 2 dùng cho hover trên cửa hàng
      </p>

      <ImageLightbox
        src={lightboxSrc}
        alt="Ảnh SKU phóng to"
        open={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
      />

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        multiple
        excludeUrls={images}
        onApply={({ added, removed }) => {
          const next = images.filter((u) => !removed.includes(u));
          for (const url of added) {
            if (!next.includes(url)) next.push(url);
          }
          onChange(next);
          setLibraryOpen(false);
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

const SKU_VIDEO_MAX = 1;
const SKU_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const SKU_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Upload video cho 1 SKU — tối đa 1 file, 50MB.
 *
 * @param {{ videos: string[], onChange: (urls: string[]) => void }} props
 */
export function SkuVideoList({ videos = [], onChange }) {
  const inputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const currentVideo = videos[0] ?? '';

  function validateFile(file) {
    if (!SKU_VIDEO_TYPES.includes(file.type)) {
      return 'Chỉ chấp nhận MP4, WebM hoặc MOV';
    }
    if (file.size > SKU_VIDEO_MAX_BYTES) {
      return 'Video tối đa 50MB';
    }
    return null;
  }

  async function handleFiles(fileList) {
    const file = Array.from(fileList ?? []).filter(Boolean)[0];
    if (!file || isUploading) return;

    const err = validateFile(file);
    if (err) {
      setUploadError(`${file.name}: ${err}`);
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok || result.error) {
        setUploadError(result.error ?? 'Upload video thất bại, vui lòng thử lại');
        return;
      }

      onChange([result.url]);
    } catch (err) {
      setUploadError(err.message ?? 'Upload video thất bại, vui lòng thử lại');
    } finally {
      setIsUploading(false);
    }
  }

  function removeVideo() {
    onChange([]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentVideo ? (
          <>
            <div className="group relative h-20 w-28 overflow-hidden rounded-lg border border-gray-200 bg-gray-900">
              <VideoPosterImage
                videoUrl={currentVideo}
                preset="preview"
                alt="Video SKU"
                loading="eager"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Xóa video"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => setLibraryOpen(true)}
              className="flex h-20 w-28 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
              title="Đổi video từ thư viện"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <span className="mt-0.5 text-[9px]">Thư viện</span>
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="flex h-20 w-28 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
              title="Tải video mới thay thế"
            >
              {isUploading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  <span className="mt-0.5 text-[9px]">Thay thế</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => setLibraryOpen(true)}
              className="flex h-20 w-28 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
              title="Chọn từ thư viện shop"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <span className="mt-0.5 text-[9px]">Thư viện</span>
            </button>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="flex h-20 w-28 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span className="mt-0.5 text-[9px]">Tải lên</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
      <p className="text-[10px] text-gray-400">
        MP4 / WebM / MOV · Tối đa 50MB · 1 video / SKU · Lưu trên Cloudinary
      </p>

      <VideoLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        currentUrl={currentVideo}
        onSelect={(url) => onChange([url])}
      />

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/**
 * Danh sách nguyên liệu (recipe) cho 1 SKU.
 *
 * @param {{
 *   recipe: Array<{ ingredient_id: string, weight_needed: number }>,
 *   onChange: (recipe: typeof recipe) => void,
 *   error?: string | null,
 * }} props
 */
export function SkuRecipeEditor({ recipe = [], onChange, error = null }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerRowIndex, setPickerRowIndex] = useState(null);
  /** @type {Record<string, { id: string, name: string, unit: string, stockLabel: string }>} */
  const [pinned, setPinned] = useState({});
  const [, startTransition] = useTransition();

  const selectedIds = useMemo(
    () => [...new Set(recipe.map((row) => row.ingredient_id).filter(Boolean))],
    [recipe],
  );

  useEffect(() => {
    if (!selectedIds.length) return;

    startTransition(async () => {
      const res = await getIngredientsForPickerByIdsAction({ ids: selectedIds });
      if (res?.items?.length) {
        const map = {};
        for (const item of res.items) {
          map[item.id] = item;
        }
        setPinned((prev) => ({ ...prev, ...map }));
      }
    });
  }, [selectedIds]);

  const optionMap = useMemo(() => new Map(Object.entries(pinned)), [pinned]);

  function openPicker(index) {
    setPickerRowIndex(index);
    setPickerOpen(true);
  }

  function addRow() {
    openPicker(recipe.length);
  }

  function updateRow(index, field, value) {
    const next = recipe.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    onChange(next);
  }

  function removeRow(index) {
    onChange(recipe.filter((_, i) => i !== index));
  }

  function handlePick(option) {
    if (pickerRowIndex === null || !option?.id) return;

    setPinned((prev) => ({ ...prev, [option.id]: option }));

    if (pickerRowIndex >= recipe.length) {
      onChange([...recipe, { ingredient_id: option.id, weight_needed: 0 }]);
    } else {
      updateRow(pickerRowIndex, 'ingredient_id', option.id);
    }

    setPickerOpen(false);
    setPickerRowIndex(null);
  }

  function closePicker() {
    setPickerOpen(false);
    setPickerRowIndex(null);
  }

  const excludeIds = recipe
    .map((row, i) => (i === pickerRowIndex ? '' : row.ingredient_id))
    .filter(Boolean);

  return (
    <div className="space-y-1.5">
      {recipe.map((row, i) => {
        const selected = optionMap.get(row.ingredient_id);
        const missing = row.ingredient_id && !selected;

        return (
          <div key={i} className="flex min-w-0 flex-wrap items-start gap-1.5">
            <div className="min-w-0 flex-1 space-y-1">
              <button
                type="button"
                onClick={() => openPicker(i)}
                className={cn(
                  recipeInputCls('w-full text-left'),
                  !row.ingredient_id && 'text-gray-400',
                  missing && 'border-amber-300 bg-amber-50/50',
                  error && !row.ingredient_id && 'border-red-300',
                )}
              >
                {selected?.name ?? (row.ingredient_id ? `ID: ${row.ingredient_id.slice(0, 8)}…` : 'Chọn nguyên liệu *')}
              </button>
              {row.ingredient_id && (
                <ProductIdCopy
                  id={row.ingredient_id}
                  size="picker"
                  showLabel={false}
                  variant="compact"
                  label="Mã nguyên liệu"
                  className="w-full"
                />
              )}
            </div>
            <input
              type="number"
              min={0}
              step={1}
              value={row.weight_needed || ''}
              onChange={(e) => updateRow(i, 'weight_needed', Number(e.target.value))}
              placeholder="Gram"
              className={cn(
                recipeInputCls('w-24 text-right'),
                error && (!row.weight_needed || row.weight_needed <= 0) && 'border-red-300',
              )}
            />
            <span className="text-xs text-gray-400">g</span>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              aria-label="Xóa nguyên liệu"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRow}
        className="text-xs font-medium text-brand-primary hover:underline transition-colors"
      >
        + Nguyên liệu cần dùng
      </button>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <IngredientPickerModal
        open={pickerOpen}
        onClose={closePicker}
        onSelect={handlePick}
        excludeIds={excludeIds}
      />
    </div>
  );
}

function recipeInputCls(extra) {
  return cn(
    'rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-brand-dark outline-none',
    'focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition',
    extra,
  );
}
