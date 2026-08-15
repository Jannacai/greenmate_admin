'use client';

import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import {
  HERO_PLACEMENTS,
  BANNER_PLACEMENT_LABELS,
  BANNER_DESKTOP_IMAGE,
  BANNER_MOBILE_IMAGE,
  BANNER_DESKTOP_ASPECT_CLASS,
  BANNER_MOBILE_ASPECT_CLASS,
} from '@/lib/banners/bannerSchema';
import { formatImagePixelSize } from '@/lib/shared/imageDimensions';
import BannerFormImagesSection from '@/components/banners/BannerFormImagesSection';
import { useBannerForm } from '@/components/banners/useBannerForm';
import {
  AdminButton,
  AdminField,
  AdminInput,
  FormCard,
  FormPublishToggle,
  FormStickyActions,
} from '@/components/admin';
import { cn } from '@/lib/shared/utils';

/**
 * Form tạo/sửa slide hero slider — vị trí home / hạt / sữa hạt.
 * @param {{
 *   mode: 'create' | 'edit',
 *   bannerId?: string,
 *   initial?: object | null,
 *   canSubmit?: boolean,
 *   cancelHref?: string,
 *   defaultPlacement?: string,
 * }} props
 */
export default function HeroBannerForm({
  mode,
  bannerId,
  initial = null,
  canSubmit = true,
  cancelHref = '/banners',
  defaultPlacement = 'home_hero',
}) {
  const router = useRouter();
  const {
    form,
    isEdit,
    isPending,
    fieldDisabled,
    desktopUrl,
    setDesktopUrl,
    mobileUrl,
    setMobileUrl,
    onSubmit,
    fieldError,
  } = useBannerForm({
    mode,
    kind: 'hero_slider',
    bannerId,
    initial,
    cancelHref,
    defaultPlacement,
    successLabels: {
      create: 'Đã tạo slide hero',
      update: 'Đã cập nhật slide hero',
    },
  });

  const { register, handleSubmit, watch, control } = form;
  const isActive = watch('is_active');
  const disabled = !canSubmit || fieldDisabled;

  return (
    <div className="pb-24 lg:pb-0">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('kind')} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start">
          <aside className="relative z-20 order-1 min-w-0 space-y-4 lg:sticky lg:top-4 lg:order-2">
            <FormCard title="Cấu hình slide hero">
              <AdminField label="Tiêu đề (admin / alt)" error={fieldError('title')}>
                <AdminInput
                  {...register('title')}
                  error={Boolean(fieldError('title'))}
                  placeholder="VD: Banner Tết 2026 — slide 1"
                  disabled={disabled}
                />
              </AdminField>

              <AdminField label="Vị trí slider" required error={fieldError('placement')}>
                <Controller
                  name="placement"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Vị trí slider">
                      {HERO_PLACEMENTS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          disabled={disabled}
                          aria-pressed={field.value === p}
                          onClick={() => field.onChange(p)}
                          className={cn(
                            'min-h-[44px] rounded-xl border px-3 py-2.5 text-left transition-colors',
                            field.value === p
                              ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/30'
                              : 'border-gray-200 bg-white hover:border-brand-primary hover:text-brand-primary',
                            disabled && 'pointer-events-none cursor-not-allowed opacity-60',
                          )}
                        >
                          <span className="block text-sm font-semibold text-brand-dark">
                            {BANNER_PLACEMENT_LABELS[p]}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </AdminField>

              <AdminField
                label="Thứ tự trong slider"
                error={fieldError('sort_order')}
                hint="Số nhỏ hiển thị trước trong carousel"
              >
                <AdminInput
                  type="number"
                  min={0}
                  {...register('sort_order')}
                  error={Boolean(fieldError('sort_order'))}
                  disabled={disabled}
                  className="text-center tabular-nums"
                />
              </AdminField>

              <FormPublishToggle
                register={register}
                isActive={isActive}
                isEdit={isEdit}
                disabled={disabled}
                activeTitle="Slide đang hiển thị"
                createTitle="Xuất bản ngay"
              />
            </FormCard>
          </aside>

          <div className="relative z-0 order-2 min-w-0 space-y-5 overflow-hidden lg:order-1">
            <BannerFormImagesSection
              desktopUrl={desktopUrl}
              setDesktopUrl={setDesktopUrl}
              mobileUrl={mobileUrl}
              setMobileUrl={setMobileUrl}
              desktopSpec={BANNER_DESKTOP_IMAGE}
              mobileSpec={BANNER_MOBILE_IMAGE}
              desktopAspect={BANNER_DESKTOP_ASPECT_CLASS}
              mobileAspect={BANNER_MOBILE_ASPECT_CLASS}
              fieldDisabled={disabled}
              fieldError={fieldError}
              register={register}
              mobileMinSize
              imagesHint={`Mỗi slide gồm 2 ảnh — desktop ${formatImagePixelSize(BANNER_DESKTOP_IMAGE)}, mobile tối thiểu ${formatImagePixelSize(BANNER_MOBILE_IMAGE)}. Chữ CTA nên nằm trong ảnh.`}
            />
          </div>
        </div>

        {canSubmit && (
          <FormStickyActions
            isPending={isPending}
            onCancel={() => router.push(cancelHref)}
            cancelLabel={isEdit ? 'Hủy' : 'Quay lại'}
          >
            <AdminButton type="submit" disabled={isPending} className="min-h-[44px] px-5">
              {isPending
                ? isEdit
                  ? 'Đang lưu…'
                  : 'Đang tạo…'
                : isEdit
                  ? 'Lưu thay đổi'
                  : 'Tạo slide hero'}
            </AdminButton>
          </FormStickyActions>
        )}
      </form>
    </div>
  );
}
