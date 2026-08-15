'use client';

import { useRouter } from 'next/navigation';
import { formatImagePixelSize } from '@/lib/shared/imageDimensions';
import {
  CATEGORY_STRIP_DESKTOP_IMAGE,
  CATEGORY_STRIP_MOBILE_IMAGE,
  CATEGORY_STRIP_DESKTOP_ASPECT_CLASS,
  CATEGORY_STRIP_MOBILE_ASPECT_CLASS,
} from '@/lib/banners/bannerSchema';
import BannerCategoryPicker from '@/components/banners/BannerCategoryPicker';
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

/**
 * Form tạo/sửa banner danh mục (strip CTA) — gắn danh mục L1/L2.
 * @param {{
 *   mode: 'create' | 'edit',
 *   bannerId?: string,
 *   initial?: object | null,
 *   canSubmit?: boolean,
 *   cancelHref?: string,
 * }} props
 */
export default function CategoryStripBannerForm({
  mode,
  bannerId,
  initial = null,
  canSubmit = true,
  cancelHref = '/banners',
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
    kind: 'category_strip',
    bannerId,
    initial,
    cancelHref,
    successLabels: {
      create: 'Đã tạo banner danh mục',
      update: 'Đã cập nhật banner danh mục',
    },
  });

  const { register, handleSubmit, watch } = form;
  const isActive = watch('is_active');
  const disabled = !canSubmit || fieldDisabled;

  return (
    <div className="pb-24 lg:pb-0">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('kind')} />
        <input type="hidden" {...register('placement')} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start">
          <div className="order-2 min-w-0 space-y-5 overflow-hidden lg:order-1">
            <BannerFormImagesSection
              desktopUrl={desktopUrl}
              setDesktopUrl={setDesktopUrl}
              mobileUrl={mobileUrl}
              setMobileUrl={setMobileUrl}
              desktopSpec={CATEGORY_STRIP_DESKTOP_IMAGE}
              mobileSpec={CATEGORY_STRIP_MOBILE_IMAGE}
              desktopAspect={CATEGORY_STRIP_DESKTOP_ASPECT_CLASS}
              mobileAspect={CATEGORY_STRIP_MOBILE_ASPECT_CLASS}
              fieldDisabled={disabled}
              fieldError={fieldError}
              register={register}
              imagesHint={`Strip danh mục — desktop ${formatImagePixelSize(CATEGORY_STRIP_DESKTOP_IMAGE)}, mobile ${formatImagePixelSize(CATEGORY_STRIP_MOBILE_IMAGE)}.`}
            />
          </div>

          <aside className="relative z-10 order-1 min-w-0 space-y-4 lg:sticky lg:top-4 lg:order-2">
            <FormCard title="Cấu hình banner danh mục">
              <AdminField label="Tiêu đề (admin / alt)" error={fieldError('title')}>
                <AdminInput
                  {...register('title')}
                  error={Boolean(fieldError('title'))}
                  placeholder="VD: Strip Hạt dinh dưỡng — cấp 1"
                  disabled={disabled}
                />
              </AdminField>

              <BannerCategoryPicker
                register={register}
                disabled={disabled}
                error={fieldError('category_id')}
              />

              <AdminField
                label="Thứ tự hiển thị"
                error={fieldError('sort_order')}
                hint="Dùng khi nhiều strip cùng nhóm — số nhỏ ưu tiên trước"
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
                activeTitle="Banner đang hiển thị"
                createTitle="Xuất bản ngay"
              />
            </FormCard>
          </aside>
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
                  : 'Tạo banner danh mục'}
            </AdminButton>
          </FormStickyActions>
        )}
      </form>
    </div>
  );
}
