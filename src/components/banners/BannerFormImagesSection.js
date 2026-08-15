'use client';

import { formatImagePixelSize } from '@/lib/shared/imageDimensions';
import ImageUploader from '@/components/common/ImageUploader';
import { AdminField, AdminInput, FormCard } from '@/components/admin';

/**
 * Khối upload ảnh desktop/mobile + link — dùng chung hero và banner danh mục.
 * @param {{
 *   desktopUrl: string,
 *   setDesktopUrl: (v: string) => void,
 *   mobileUrl: string,
 *   setMobileUrl: (v: string) => void,
 *   desktopSpec: { width: number, height: number },
 *   mobileSpec: { width: number, height: number },
 *   desktopAspect: string,
 *   mobileAspect: string,
 *   fieldDisabled?: boolean,
 *   fieldError: (field: string) => string | undefined,
 *   register: import('react-hook-form').UseFormRegister<Record<string, unknown>>,
 *   linkHint?: string,
 *   imagesHint?: string,
 *   mobileMinSize?: boolean,
 * }} props
 */
export default function BannerFormImagesSection({
  desktopUrl,
  setDesktopUrl,
  mobileUrl,
  setMobileUrl,
  desktopSpec,
  mobileSpec,
  desktopAspect,
  mobileAspect,
  fieldDisabled = false,
  fieldError,
  register,
  linkHint = 'Đường dẫn nội bộ (VD: /bo-suu-tap/tet-2026) hoặc URL ngoài. Để trống = không click.',
  imagesHint,
  mobileMinSize = false,
}) {
  const hint =
    imagesHint ??
    `Mỗi banner gồm 2 ảnh — desktop ${formatImagePixelSize(desktopSpec)}, mobile ${formatImagePixelSize(mobileSpec)}. Chữ CTA nên nằm trong ảnh.`;

  return (
  <>
    <FormCard title="Ảnh banner" required hint={hint}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-4">
        <AdminField
          className="min-w-0 flex-[2]"
          label="Ảnh desktop"
          required
          error={fieldError('desktop_url')}
          hint={formatImagePixelSize(desktopSpec)}
        >
          <ImageUploader
            value={desktopUrl}
            onChange={setDesktopUrl}
            onClear={() => setDesktopUrl('')}
            label="Tải ảnh desktop"
            previewAspectClass={`${desktopAspect} w-full`}
            requiredSize={desktopSpec}
            className={fieldDisabled ? 'pointer-events-none opacity-60' : ''}
          />
        </AdminField>
        <AdminField
          className="min-w-0 flex-1 md:max-w-[34%]"
          label="Ảnh mobile"
          required
          error={fieldError('mobile_url')}
          hint={
            mobileMinSize
              ? `Tối thiểu ${formatImagePixelSize(mobileSpec)}`
              : formatImagePixelSize(mobileSpec)
          }
        >
          <ImageUploader
            value={mobileUrl}
            onChange={setMobileUrl}
            onClear={() => setMobileUrl('')}
            label="Tải ảnh mobile"
            previewAspectClass={`${mobileAspect} w-full`}
            requiredSize={mobileSpec}
            minSize={mobileMinSize}
            className={fieldDisabled ? 'pointer-events-none opacity-60' : ''}
          />
        </AdminField>
      </div>
    </FormCard>

    <FormCard title="Liên kết" hint="Một link chung cho cả ảnh desktop và mobile khi khách bấm banner">
      <AdminField label="Link đích" error={fieldError('link')} hint={linkHint}>
        <AdminInput
          {...register('link')}
          error={Boolean(fieldError('link'))}
          placeholder="/bo-suu-tap/tet-2026"
          disabled={fieldDisabled}
          className="font-mono text-sm"
        />
      </AdminField>
    </FormCard>
  </>
  );
}
