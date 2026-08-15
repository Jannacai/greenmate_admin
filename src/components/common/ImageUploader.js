'use client';

import { useRef, useState, useTransition } from 'react';
import { uploadImageAction } from '@/lib/actions/upload';
import OptimizedImage from '@/components/common/OptimizedImage';
import ImageLightbox from '@/components/common/ImageLightbox';
import MediaLibraryModal from '@/components/common/MediaLibraryModal';
import { cn } from '@/lib/shared/utils';
import { formatImagePixelSize, validateImageFileDimensions, validateImageFileMinDimensions, validateImageUrlDimensions, validateImageUrlMinDimensions } from '@/lib/shared/imageDimensions';

/**
 * Upload ảnh từ máy lên server.
 * - Click hoặc kéo-thả để chọn file
 * - Preview ngay bằng objectURL
 * - Tự động upload lên server, trả URL thật về parent
 *
 * @param {{
 *   value: string,
 *   onChange: (url: string) => void,
 *   onClear: () => void,
 *   className?: string,
 *   previewAspectClass?: string,
 *   label?: string,
 *   requiredSize?: { width: number, height: number },
 *   minSize?: boolean,
 * }} props
 */
export default function ImageUploader({
  value,
  onChange,
  onClear,
  className,
  previewAspectClass = 'aspect-[4/5]',
  label = 'Tải ảnh lên',
  requiredSize,
  minSize = false,
}) {
  const inputRef   = useRef(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const [previewUrl,   setPreviewUrl]   = useState('');     // local objectURL for instant preview
  const [uploadError,  setUploadError]  = useState('');
  const [isPending,    startTransition] = useTransition();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [libraryOpen,  setLibraryOpen]  = useState(false);

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

    if (requiredSize) {
      const validateDimensions = minSize
        ? validateImageFileMinDimensions
        : validateImageFileDimensions;
      const dimensionCheck = await validateDimensions(file, requiredSize);
      if (!dimensionCheck.ok) {
        setUploadError(dimensionCheck.message);
        return;
      }
    }

    setUploadError('');

    // Hiển thị preview ngay lập tức (objectURL)
    const local = URL.createObjectURL(file);
    setPreviewUrl(local);
    onChange(''); // reset URL cũ trong khi upload

    // Upload lên server
    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      URL.revokeObjectURL(local);
      setPreviewUrl('');

      if (result.error) {
        setUploadError(result.error);
        onClear?.();
      } else {
        // Lưu URL gốc (canonical) — render qua OptimizedImage
        onChange(result.url);
      }
    });
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // reset để chọn lại cùng file
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function handleLibrarySelect(url) {
    if (requiredSize) {
      setUploadError('');
      const validateDimensions = minSize
        ? validateImageUrlMinDimensions
        : validateImageUrlDimensions;
      const dimensionCheck = await validateDimensions(url, requiredSize);
      if (!dimensionCheck.ok) {
        setUploadError(dimensionCheck.message);
        return;
      }
    } else {
      setUploadError('');
    }
    setPreviewUrl('');
    onChange(url);
    setLibraryOpen(false);
  }

  function handleClear() {
    setPreviewUrl('');
    setUploadError('');
    onClear?.();
  }

  // Preview local (objectURL) hoặc ảnh đã upload (Cloudinary CDN)
  const displayUrl = value || previewUrl;
  const isLocalPreview = Boolean(previewUrl && !value);
  const isFixedSizeUpload = Boolean(requiredSize);
  const previewPreset = isFixedSizeUpload ? 'bannerAdmin' : 'card';
  const previewSizes = isFixedSizeUpload
    ? '(max-width: 768px) 100vw, 640px'
    : '(max-width: 768px) 100vw, 240px';
  const previewFitClass = isFixedSizeUpload ? 'object-contain' : 'object-cover';
  const previewWidth = requiredSize?.width ?? 420;
  const previewHeight = requiredSize?.height ?? 525;

  if (displayUrl || isPending) {
    return (
      <>
      <div className={cn('flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50', className)}>
        <div className={cn('relative w-full shrink-0 overflow-hidden bg-gray-100', previewAspectClass)}>
          {displayUrl && (
            isLocalPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob preview tức thì trước khi upload xong
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="block h-full w-full cursor-zoom-in"
                aria-label="Phóng to ảnh"
              >
                <img
                  src={displayUrl}
                  alt="Ảnh — đang tải lên"
                  className={cn('h-full w-full', previewFitClass)}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="block h-full w-full cursor-zoom-in"
                aria-label="Phóng to ảnh"
              >
                <OptimizedImage
                  src={displayUrl}
                  alt="Ảnh đã tải lên"
                  preset={previewPreset}
                  sizes={previewSizes}
                  width={previewWidth}
                  height={previewHeight}
                  className={cn('h-full w-full', previewFitClass)}
                />
              </button>
            )
          )}

          {isPending && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 gap-2">
              <svg className="h-6 w-6 animate-spin text-[#6B4E3D]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs font-medium text-gray-500">Đang tải lên...</p>
            </div>
          )}
        </div>

        {!isPending && displayUrl && (
          <div className="flex shrink-0 items-center justify-between gap-0.5 border-t border-gray-200 bg-white px-1 py-1">
            <PreviewActionButton
              icon={IconZoom}
              label="Phóng to"
              onClick={() => setLightboxOpen(true)}
            />
            <PreviewActionButton
              icon={IconLibrary}
              label="Thư viện"
              onClick={() => setLibraryOpen(true)}
            />
            <PreviewActionButton
              icon={IconImage}
              label="Thay ảnh"
              onClick={() => inputRef.current?.click()}
            />
            <PreviewActionButton
              icon={IconTrash}
              label="Xóa"
              onClick={handleClear}
              variant="danger"
            />
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleInputChange} />
      </div>

      {uploadError && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          {uploadError}
        </p>
      )}

      <ImageLightbox
        src={displayUrl}
        alt="Ảnh sản phẩm"
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        currentUrl={value}
        onSelect={handleLibrarySelect}
      />
      </>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-2">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'flex w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-all',
          previewAspectClass,
          isDragging
            ? 'border-[#6B4E3D] bg-[#6B4E3D]/5 scale-[0.99]'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
          className,
        )}
      >
        <div className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
          isDragging ? 'bg-[#6B4E3D]/15' : 'bg-gray-200',
        )}>
          <svg className={cn('h-5 w-5', isDragging ? 'text-[#6B4E3D]' : 'text-gray-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="mt-0.5 text-xs text-gray-400">Kéo thả hoặc click để chọn</p>
          <p className="text-xs text-gray-400">
            JPG, PNG, WebP · Tối đa 5MB
            {requiredSize
              ? ` · ${minSize ? 'Tối thiểu ' : ''}${formatImagePixelSize(requiredSize)}`
              : ''}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setLibraryOpen(true)}
        className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-medium text-gray-600 hover:border-[#6B4E3D] hover:text-[#6B4E3D] transition-colors"
      >
        <IconLibrary className="h-5 w-5" />
        Thư viện
      </button>
      </div>

      {uploadError && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          {uploadError}
        </p>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleInputChange} />

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        currentUrl={value}
        onSelect={handleLibrarySelect}
      />
    </div>
  );
}

function IconZoom({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
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

/**
 * Nút action gọn cho preview ảnh — icon + label ngắn, chia đều chiều ngang.
 * @param {{ icon: React.ComponentType<{ className?: string }>, label: string, onClick: () => void, variant?: 'default' | 'danger' }} props
 */
function PreviewActionButton({ icon: Icon, label, onClick, variant = 'default' }) {
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
