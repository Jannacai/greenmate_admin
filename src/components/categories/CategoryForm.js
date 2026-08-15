'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createCategoryAction,
  updateCategoryAction,
} from '@/lib/actions/category';
import {
  CATEGORY_L2_PRODUCT_TYPE_OPTIONS,
  categoryFormSchema,
} from '@/lib/categories/categorySchema';
import { CATEGORY_MENU_IMAGE } from '@/lib/categories/categoryImageSpecs';
import { getCategoryStorefrontPath } from '@/lib/categories/categoryDisplay';
import { formatImagePixelSize } from '@/lib/shared/imageDimensions';
import { showError, showSuccess } from '@/lib/shared/toast';
import ImageUploader from '@/components/common/ImageUploader';
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  FormCard,
  FormPublishToggle,
  FormStickyActions,
} from '@/components/admin';

/**
 * Form thêm/sửa loại sản phẩm (danh mục cấp 2) — L1 ẩn, tự gán theo nhóm.
 *
 * @param {{
 *   mode: 'create' | 'edit',
 *   categoryId?: string,
 *   initial?: object | null,
 *   canSubmit?: boolean,
 *   cancelHref?: string,
 * }} props
 */
export default function CategoryForm({
  mode,
  categoryId,
  initial = null,
  canSubmit = true,
  cancelHref = '/categories',
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const actionFn = isEdit && categoryId
    ? updateCategoryAction.bind(null, categoryId)
    : createCategoryAction;

  const [state, formAction] = useActionState(actionFn, null);
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(initial?.category_image ?? '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initial?.category_name ?? '',
      slug: initial?.category_slug ?? '',
      description: initial?.category_description ?? '',
      image: initial?.category_image ?? '',
      product_type: initial?.category_product_type === 'milkseed' ? 'milkseed' : 'dryseed',
      sort_order: initial?.category_sort_order ?? 0,
      is_active: Boolean(initial?.category_is_active),
    },
  });

  const isActive = watch('is_active');
  const fieldDisabled = !canSubmit || isPending;

  useEffect(() => {
    setValue('image', imageUrl, { shouldValidate: true });
  }, [imageUrl, setValue]);

  useEffect(() => {
    if (state?.success) {
      showSuccess(isEdit ? 'Đã cập nhật loại sản phẩm' : 'Đã thêm loại sản phẩm');
      if (!isEdit && state.categoryId) {
        router.push(`/categories/${state.categoryId}/edit`);
      } else {
        router.refresh();
      }
    } else if (state?.error) {
      showError(state.error);
    }
  }, [state, isEdit, router]);

  const onSubmit = handleSubmit((values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      fd.set(key, key === 'is_active' ? String(Boolean(val)) : String(val ?? ''));
    });
    startTransition(() => formAction(fd));
  });

  const previewSlug = watch('slug') || watch('name');
  const storefrontPath = previewSlug
    ? getCategoryStorefrontPath({
        category_level: 2,
        category_slug: String(previewSlug).trim().toLowerCase().replace(/\s+/g, '-'),
      })
    : getCategoryStorefrontPath(initial ?? {});

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-24">
      <FormCard
        title="Loại sản phẩm"
        hint="VD: Hạt điều, Óc chó — hiển thị trên menu trang chủ và trang /danh-muc/[slug]"
        required
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Tên loại sản phẩm" required error={errors.name?.message}>
            <AdminInput
              {...register('name')}
              error={Boolean(errors.name)}
              placeholder="VD: Hạt điều"
              disabled={fieldDisabled}
            />
          </AdminField>

          <AdminField label="Slug URL" hint="Để trống → tự sinh từ tên" error={errors.slug?.message}>
            <AdminInput
              {...register('slug')}
              error={Boolean(errors.slug)}
              placeholder="hat-dieu"
              disabled={fieldDisabled}
              className="font-mono"
            />
          </AdminField>

          <AdminField label="Thuộc nhóm" required error={errors.product_type?.message}>
            <AdminSelect
              {...register('product_type')}
              error={Boolean(errors.product_type)}
              disabled={fieldDisabled || isEdit}
              className="h-9 min-h-9 px-2.5 text-sm"
            >
              {CATEGORY_L2_PRODUCT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </AdminSelect>
          </AdminField>

          <AdminField label="Thứ tự trên menu" error={errors.sort_order?.message}>
            <AdminInput
              type="number"
              min={0}
              {...register('sort_order')}
              disabled={fieldDisabled}
            />
          </AdminField>

          <AdminField
            label="Ảnh menu"
            hint={`Tải ảnh hoặc chọn từ thư viện — tối thiểu ${formatImagePixelSize(CATEGORY_MENU_IMAGE)} (tỉ lệ thẻ menu trang chủ)`}
            error={errors.image?.message}
            className="md:col-span-2"
          >
            <div className="mx-auto w-full max-w-[200px]">
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                onClear={() => setImageUrl('')}
                label="Tải ảnh menu"
                previewAspectClass="aspect-[672/930] w-full"
                requiredSize={CATEGORY_MENU_IMAGE}
                minSize
                className={fieldDisabled ? 'pointer-events-none opacity-60' : ''}
              />
            </div>
          </AdminField>
        </div>

        <AdminField label="Mô tả ngắn" error={errors.description?.message}>
          <AdminTextarea
            rows={3}
            {...register('description')}
            disabled={fieldDisabled}
            placeholder="Mô tả hiển thị trên trang danh mục (tùy chọn)"
          />
        </AdminField>

        {storefrontPath && (
          <p className="text-xs text-gray-500">
            Storefront: <span className="font-mono">{storefrontPath}</span>
          </p>
        )}
      </FormCard>

      <FormPublishToggle
        register={register}
        isActive={isActive}
        isEdit={isEdit}
        disabled={fieldDisabled}
        activeTitle="Đang hiển thị trên storefront"
        createTitle="Hiển thị ngay trên storefront"
        createHint="Bỏ chọn để lưu ẩn, bật lại sau từ danh sách"
      />

      <FormStickyActions>
        <AdminButton type="button" variant="secondary" href={cancelHref}>
          Hủy
        </AdminButton>
        <AdminButton type="submit" disabled={fieldDisabled}>
          {isPending ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm loại sản phẩm'}
        </AdminButton>
      </FormStickyActions>
    </form>
  );
}
