'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collectionSchema } from '@/lib/collections/collectionSchema';
import {
  createCollectionAction,
  updateCollectionAction,
} from '@/lib/actions/collection';
import { getCollectionStorefrontPath } from '@/lib/collections/collectionDisplay';
import { showError, showSuccess } from '@/lib/shared/toast';
import VoucherProductPicker from '@/components/vouchers/VoucherProductPicker';
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminTextarea,
  FormCard,
  FormPublishToggle,
  FormStickyActions,
} from '@/components/admin';

/**
 * @param {{
 *   mode: 'create' | 'edit',
 *   collectionId?: string,
 *   initial?: object | null,
 *   canSubmit?: boolean,
 *   cancelHref?: string,
 * }} props
 */
export default function CollectionForm({
  mode,
  collectionId,
  initial = null,
  canSubmit = true,
  cancelHref = '/collections',
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const actionFn =
    isEdit && collectionId
      ? updateCollectionAction.bind(null, collectionId)
      : createCollectionAction;

  const [state, formAction] = useActionState(actionFn, null);
  const [isPending, startTransition] = useTransition();
  const [selectedProducts, setSelectedProducts] = useState(
    () => (initial?.collection_product_ids ?? []).map(String),
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: initial?.collection_name ?? '',
      slug: initial?.collection_slug ?? '',
      description: initial?.collection_description ?? '',
      product_ids: (initial?.collection_product_ids ?? []).map(String),
      sort_order: initial?.collection_sort_order ?? 0,
      is_active: initial?.collection_is_active ?? false,
    },
  });

  const slug = watch('slug');
  const name = watch('name');
  const isActive = watch('is_active');
  const fieldDisabled = !canSubmit || isPending;
  const previewPath = slug
    ? getCollectionStorefrontPath({ collection_slug: slug })
    : name
      ? getCollectionStorefrontPath({
          collection_slug: name.toLowerCase().replace(/\s+/g, '-'),
        })
      : '/bo-suu-tap/…';

  useEffect(() => {
    setValue('product_ids', selectedProducts);
  }, [selectedProducts, setValue]);

  useEffect(() => {
    if (state?.error) {
      showError('Không lưu được bộ sưu tập', state.error);
    }
  }, [state?.error]);

  useEffect(() => {
    if (!state?.success) return;

    if (mode === 'create') {
      showSuccess('Đã tạo bộ sưu tập');
      router.push(state.collectionId ? `/collections/${state.collectionId}` : '/collections');
      return;
    }

    showSuccess(state.message ?? 'Đã cập nhật bộ sưu tập');
    router.push(collectionId ? `/collections/${collectionId}` : '/collections');
  }, [state?.success, state?.message, state?.collectionId, mode, collectionId, router]);

  function onSubmit(data) {
    const formData = new FormData();
    for (const [key, val] of Object.entries(data)) {
      if (key === 'is_active') {
        formData.set(key, val ? 'true' : 'false');
      } else if (Array.isArray(val)) {
        formData.set(key, val.join(','));
      } else {
        formData.set(key, String(val ?? ''));
      }
    }
    startTransition(() => formAction(formData));
  }

  const fieldError = (field) =>
    errors[field]?.message ?? state?.fieldErrors?.[field]?.[0];

  const productCount = selectedProducts.length;

  return (
    <div className="pb-24 lg:pb-0">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start">
          <div className="order-2 min-w-0 space-y-5 lg:order-1">
            <FormCard
              title="Thông tin cơ bản"
              hint="Tên và slug dùng cho URL storefront /bo-suu-tap/[slug]"
            >
              <AdminField label="Tên bộ sưu tập" required error={fieldError('name')}>
                <AdminInput
                  {...register('name')}
                  error={Boolean(fieldError('name'))}
                  placeholder="VD: Quà Tết 2026"
                  disabled={fieldDisabled}
                />
              </AdminField>

              <AdminField
                label="Slug (URL)"
                error={fieldError('slug')}
                hint="Để trống → tự tạo từ tên"
              >
                <AdminInput
                  {...register('slug')}
                  error={Boolean(fieldError('slug'))}
                  placeholder="tet-2026"
                  disabled={fieldDisabled}
                  className="font-mono"
                />
              </AdminField>

              <AdminField label="Mô tả" error={fieldError('description')}>
                <AdminTextarea
                  {...register('description')}
                  rows={3}
                  error={Boolean(fieldError('description'))}
                  placeholder="Mô tả ngắn cho admin / SEO sau này"
                  disabled={fieldDisabled}
                  className="resize-y min-h-[80px] max-h-40"
                />
              </AdminField>
            </FormCard>

            <FormCard
              title="Sản phẩm"
              required
              badge={productCount > 0 ? `${productCount} SP` : undefined}
              hint="Thứ tự chọn = thứ tự hiển thị trên storefront"
            >
              {fieldError('product_ids') && (
                <p className="mb-2 text-sm text-red-500">{fieldError('product_ids')}</p>
              )}
              <div className="rounded-xl border border-gray-100 bg-brand-gray/30 p-3 md:p-4">
                <VoucherProductPicker
                  selectedIds={selectedProducts}
                  onChange={setSelectedProducts}
                  disabled={fieldDisabled}
                />
              </div>
            </FormCard>
          </div>

          <aside className="order-1 min-w-0 space-y-4 lg:sticky lg:top-4 lg:order-2">
            <FormCard title="Hiển thị">
              <AdminField
                label="Thứ tự"
                error={fieldError('sort_order')}
                hint="Sắp xếp giữa các bộ sưu tập"
              >
                <AdminInput
                  type="number"
                  min={0}
                  {...register('sort_order')}
                  error={Boolean(fieldError('sort_order'))}
                  disabled={fieldDisabled}
                  className="text-center tabular-nums"
                />
              </AdminField>

              <FormPublishToggle
                register={register}
                isActive={isActive}
                isEdit={isEdit}
                disabled={fieldDisabled}
                activeTitle="Bộ sưu tập đang hiển thị"
                createTitle="Xuất bản ngay"
              />
            </FormCard>

            <FormCard title="URL storefront" hint="Banner hero có thể trỏ link này">
              <code className="block rounded-lg border border-gray-200 bg-brand-gray px-3 py-2.5 text-xs font-mono text-brand-dark break-all">
                {previewPath}
              </code>
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
                  : 'Tạo bộ sưu tập'}
            </AdminButton>
          </FormStickyActions>
        )}
      </form>
    </div>
  );
}
