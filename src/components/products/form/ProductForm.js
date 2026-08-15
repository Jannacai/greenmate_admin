'use client';

import Link from 'next/link';
import { useState, useTransition, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { createProductAction, updateProductFullAction } from '@/lib/actions/product';
import ProductFormStorefrontPreview from '@/components/products/form/ProductFormStorefrontPreview';
import ProductDetailAttributesFields from '@/components/products/form/ProductDetailAttributesFields';
import { showError, showWarning } from '@/lib/shared/toast';
import VariationEditor from '@/components/products/form/VariationEditor';
import SkuMatrix from '@/components/products/form/SkuMatrix';
import ProductCategoryPicker from '@/components/products/form/ProductCategoryPicker';
import {
  buildProductPayload,
  CREATE_FORM_DEFAULTS,
  generateSkus,
  mapProductToFormState,
  PRODUCT_BADGE_TYPE_OPTIONS,
  resolveMinSkuPrice,
  serializeProductFormDraftSnapshot,
  updateSkuImagesForTier,
  validateSkuRecipe,
} from '@/lib/products/productForm';
import { buildSkuDefaultSelectLabel, buildProductPreviewFromFormDraft } from '@/lib/products/productPreview';
import {
  formatEligibleVoucherOptionLabel,
  getProductFormVoucherOptions,
  isProductVoucherLockedToApplied,
  matchEligibleVoucherCode,
  resolveProductFormVoucherCode,
} from '@/lib/products/productVoucherPicker';
import { saveVariationPresetsFromProduct } from '@/lib/products/variationPresets';
import { pickProductCodeFromApi } from '@/lib/products/productDisplay';
import { generateProductCode, normalizeProductCodeInput } from '@/lib/products/sku';
import {
  collectFormImageUrls,
  collectFormVideoUrls,
  diffRemovedMediaUrls,
  collectProductImageUrls,
  collectProductVideoUrls,
  isVideoStorageUrl,
  resolveDefaultThumbFromSkus,
  resolveProductThumb,
} from '@/lib/products/productImages';
import { PRODUCT_INFO_ATTRIBUTE_KEYS } from '@/lib/products/productInfoAttributes';
import { cn } from '@/lib/shared/utils';
import {
  FormCard,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  FormStickyActions,
  FormSubmitButton,
  FormSubmitButtonOutline,
} from '@/components/admin';

const optionalInfoField = z.string().max(5000).optional();

const schema = z.object({
  product_name: z.string().min(3, 'Tên tối thiểu 3 ký tự'),
  product_type: z.enum(['dryseed', 'milkseed'], { message: 'Chọn loại sản phẩm' }),
  product_category_id: z.string().optional(),
  product_descriptions: z.string().optional(),
  ...Object.fromEntries(PRODUCT_INFO_ATTRIBUTE_KEYS.map((key) => [key, optionalInfoField])),
  badge_type: z.string().optional(),
  badge_text: z.string().optional(),
  voucher_code: z.string().optional(),
});

/**
 * Form tạo / sửa sản phẩm.
 *
 * @param {{
 *   shopId: string,
 *   mode?: 'create' | 'edit',
 *   product?: object,
 *   productId?: string,
 *   status?: 'published' | 'draft',
 *   eligibleVouchers?: Array<{
 *     id: string,
 *     code: string,
 *     name: string,
 *     description: string,
 *     valueLabel: string,
 *     minOrder: number,
 *   }>,
 * }} props
 */
export default function ProductForm({
  shopId,
  mode = 'create',
  product,
  productId,
  status = 'draft',
  eligibleVouchers = [],
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const [submitDone, setSubmitDone] = useState(false);
  const mapped = useMemo(
    () => (isEdit && product ? mapProductToFormState(product) : null),
    [isEdit, product],
  );

  const voucherLockedToApplied = isEdit && isProductVoucherLockedToApplied(product);

  const voucherOptions = useMemo(
    () => (isEdit && product
      ? getProductFormVoucherOptions(product, eligibleVouchers)
      : eligibleVouchers),
    [isEdit, product, eligibleVouchers],
  );

  const initialFormDefaults = useMemo(() => {
    const base = mapped?.formDefaults ?? CREATE_FORM_DEFAULTS;
    if (!isEdit || !product) return base;
    return {
      ...base,
      voucher_code: matchEligibleVoucherCode(
        resolveProductFormVoucherCode(product),
        voucherOptions,
      ),
    };
  }, [mapped, isEdit, product, voucherOptions]);

  const [isPending, startTransition] = useTransition();
  const [thumbUrl, setThumbUrl] = useState(mapped?.thumbUrl ?? '');
  const [variations, setVariations] = useState(mapped?.variations ?? []);
  const [skus, setSkus] = useState(mapped?.skus ?? []);
  const [productCode, setProductCode] = useState(
    () => mapped?.productCode || (isEdit && product ? (pickProductCodeFromApi(product) ?? generateProductCode()) : generateProductCode()),
  );
  const [productCodeError, setProductCodeError] = useState('');
  const [showSkuRecipeErrors, setShowSkuRecipeErrors] = useState(false);

  const knownMediaUrlsRef = useRef(new Set());
  const thumbManualRef = useRef(Boolean(mapped?.thumbUrl));

  useEffect(() => {
    if (isEdit && product) {
      collectProductImageUrls(product).forEach((url) => knownMediaUrlsRef.current.add(url));
      collectProductVideoUrls(product).forEach((url) => knownMediaUrlsRef.current.add(url));
    }
  }, [isEdit, product]);

  useEffect(() => {
    collectFormImageUrls(thumbUrl, skus).forEach((url) => knownMediaUrlsRef.current.add(url));
    collectFormVideoUrls(skus).forEach((url) => knownMediaUrlsRef.current.add(url));
  }, [thumbUrl, skus]);

  useEffect(() => {
    if (thumbManualRef.current) return;
    const auto = resolveDefaultThumbFromSkus(skus);
    setThumbUrl(auto);
  }, [skus]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialFormDefaults,
  });

  const watchedForm = watch();

  useEffect(() => {
    if (!isEdit || !product?._id) return;
    const code = matchEligibleVoucherCode(
      resolveProductFormVoucherCode(product),
      voucherOptions,
    );
    setValue('voucher_code', code);
  }, [isEdit, product, voucherOptions, setValue]);

  const variationsKey = JSON.stringify(variations);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tái sinh SKU khi đổi variations/mã SP
    setSkus((prev) => generateSkus(variations, prev, productCode, { preserveSkuCodes: isEdit }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variationsKey, productCode, isEdit]);

  const minSkuPrice = useMemo(() => resolveMinSkuPrice(skus), [skus]);

  const selectedVoucherCode = watch('voucher_code');
  const badgeType = watch('badge_type');
  const badgeText = watch('badge_text');
  const productName = watch('product_name');
  const badgeTypeField = register('badge_type');
  const selectedVoucher = useMemo(
    () => voucherOptions.find((v) => v.code === selectedVoucherCode) ?? null,
    [voucherOptions, selectedVoucherCode],
  );
  const savedVoucherCode = initialFormDefaults.voucher_code ?? '';
  const staleVoucherCode =
    savedVoucherCode &&
      !voucherOptions.some((v) => v.code?.toUpperCase() === savedVoucherCode.toUpperCase())
      ? savedVoucherCode
      : null;

  const previewProduct = useMemo(
    () => buildProductPreviewFromFormDraft({
      productName,
      thumbUrl,
      variations,
      skus,
      badgeType,
      badgeText,
      selectedVoucher,
      minSkuPrice,
    }),
    [productName, thumbUrl, variations, skus, badgeType, badgeText, selectedVoucher, minSkuPrice],
  );

  const initialEditSnapshot = useMemo(() => {
    if (!isEdit || !mapped) return null;
    return serializeProductFormDraftSnapshot({
      values: initialFormDefaults,
      thumbUrl: mapped.thumbUrl,
      variations: mapped.variations,
      skus: mapped.skus,
      productCode: mapped.productCode,
      eligibleVouchers: voucherOptions,
    });
  }, [isEdit, mapped, initialFormDefaults, voucherOptions]);

  const currentEditSnapshot = useMemo(() => {
    if (!isEdit || !mapped) return null;
    return serializeProductFormDraftSnapshot({
      values: watchedForm,
      thumbUrl,
      variations,
      skus,
      productCode,
      eligibleVouchers: voucherOptions,
    });
  }, [isEdit, mapped, watchedForm, thumbUrl, variations, skus, productCode, voucherOptions]);

  const hasEditChanges = isEdit && initialEditSnapshot !== null && currentEditSnapshot !== initialEditSnapshot;

  function runSubmit(values, publishNow = false) {
    if (submitDone) return;

    const finalThumb = resolveProductThumb(thumbUrl, skus);

    if (!finalThumb) {
      showWarning('Thiếu ảnh đại diện', 'Thêm ảnh biến thể mặc định hoặc tải ảnh đại diện');
      return;
    }

    if (minSkuPrice < 1000) {
      showWarning('Giá chưa hợp lệ', 'Nhập giá tối thiểu 1.000đ cho ít nhất một biến thể');
      return;
    }

    const badRecipeIdx = skus.findIndex((sku) => validateSkuRecipe(sku.sku_recipe));
    if (badRecipeIdx >= 0) {
      setShowSkuRecipeErrors(true);
      const label = buildSkuDefaultSelectLabel(
        { sku_tier_idx: skus[badRecipeIdx].sku_tier_idx },
        variations.filter((v) => v.name?.trim() && v.options?.length),
      );
      showWarning(
        'Thiếu nguyên liệu',
        `${label}: ${validateSkuRecipe(skus[badRecipeIdx].sku_recipe)}`,
      );
      return;
    }
    setShowSkuRecipeErrors(false);

    const validVariations = variations.filter((v) => v.name?.trim() && v.options?.length);
    saveVariationPresetsFromProduct(validVariations);

    const payload = buildProductPayload({
      values,
      thumbUrl: finalThumb,
      shopId,
      variations,
      skus,
      productCode,
      eligibleVouchers: voucherOptions,
      existingProductAttributes: isEdit ? product?.product_attributes : null,
    });

    startTransition(async () => {
      const currentMediaUrls = [
        ...collectFormImageUrls(thumbUrl, skus),
        ...collectFormVideoUrls(skus),
      ];
      const removedMediaUrls = diffRemovedMediaUrls([...knownMediaUrlsRef.current], currentMediaUrls);
      const removedImageUrls = removedMediaUrls.filter((url) => !isVideoStorageUrl(url));
      const removedVideoUrls = removedMediaUrls.filter((url) => isVideoStorageUrl(url));

      const res = isEdit
        ? await updateProductFullAction(productId, payload, { publish: publishNow, removedImageUrls, removedVideoUrls })
        : await createProductAction(payload, { publish: publishNow, removedImageUrls, removedVideoUrls });

      if (res?.fieldErrors) {
        const codeErr = res.fieldErrors.product_code?.[0];
        if (codeErr) setProductCodeError(codeErr);
        const msg = Object.values(res.fieldErrors).flat()[0];
        showError('Dữ liệu không hợp lệ', msg ?? 'Kiểm tra lại các trường bắt buộc');
      } else if (res?.error) {
        showError('Không lưu được sản phẩm', res.error);
      } else if (res?.success) {
        setSubmitDone(true);
        const toastKey = res.toast ?? (isEdit ? 'updated' : 'draft');
        router.replace(`/products?toast=${toastKey}`);
      }
    });
  }

  // eslint-disable-next-line react-hooks/refs -- RHF handleSubmit; ref ảnh chỉ đọc khi user bấm lưu
  const onSaveDraft = handleSubmit((values) => runSubmit(values, false));
  // eslint-disable-next-line react-hooks/refs
  const onPublish = handleSubmit((values) => runSubmit(values, true));

  return (
    <div className="min-w-0 overflow-x-hidden pb-24 lg:pb-0">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start">
        {/* Sidebar essentials — hiển thị trước trên mobile */}
        <aside className="order-1 space-y-4 min-w-0 lg:order-2 lg:sticky lg:top-4">
          <FormCard title="Xem trước sản phẩm" required>
            <ProductFormStorefrontPreview
              product={previewProduct}
              thumbUrl={thumbUrl}
              onThumbChange={(url) => {
                thumbManualRef.current = Boolean(url);
                setThumbUrl(url);
              }}
              onThumbClear={() => {
                thumbManualRef.current = false;
                setThumbUrl(resolveDefaultThumbFromSkus(skus));
              }}
              onSkuImagesReorder={(tierIdx, images) => {
                setSkus((prev) => updateSkuImagesForTier(prev, tierIdx, images));
              }}
            />
          </FormCard>

          <FormCard title="Loại & giá" compact>
            <div className="space-y-2">
              <AdminField
                label="Loại SP"
                layout="row"
                compact
                required
                error={errors.product_type?.message}
                hint={isEdit ? 'Không đổi sau khi tạo' : undefined}
              >
                <AdminSelect
                  {...register('product_type')}
                  error={Boolean(errors.product_type)}
                  disabled={isEdit}
                  className="h-9 min-h-9 px-2.5 text-sm"
                >
                  <option value="dryseed">Hạt khô</option>
                  <option value="milkseed">Sữa hạt</option>
                </AdminSelect>
              </AdminField>

              <Controller
                name="product_category_id"
                control={control}
                render={({ field }) => (
                  <ProductCategoryPicker
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    productType={watch('product_type')}
                    errors={errors}
                    initialCategoryLabel={product?.product_category_name ?? product?.product_category_slug ?? ''}
                  />
                )}
              />

              <AdminField label="Giá thấp nhất" layout="row" compact hint="Tự tính từ ma trận SKU">
                <AdminInput
                  type="text"
                  readOnly
                  tabIndex={-1}
                  value={minSkuPrice >= 1000 ? minSkuPrice.toLocaleString('vi-VN') : ''}
                  placeholder="—"
                  className="h-9 min-h-9 cursor-default bg-brand-gray px-2.5 text-right text-sm text-gray-600"
                />
              </AdminField>

              <AdminField
                label="Mã SP"
                layout="row"
                compact
                hint="Tiền tố mã SKU · VD: GMHSRAU4-S"
                error={productCodeError || undefined}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <AdminInput
                    type="text"
                    value={productCode}
                    onChange={(e) => {
                      setProductCodeError('');
                      const next = normalizeProductCodeInput(e.target.value);
                      if (next) setProductCode(next);
                      else if (!e.target.value.trim()) setProductCode('');
                    }}
                    onBlur={() => {
                      if (!productCode.trim()) {
                        setProductCode(isEdit && product ? (pickProductCodeFromApi(product) ?? generateProductCode()) : generateProductCode());
                      }
                    }}
                    readOnly={isEdit}
                    placeholder="GM7X2K9P"
                    error={Boolean(productCodeError)}
                    className={cn(
                      'h-9 min-h-9 min-w-0 flex-1 px-2.5 font-mono text-sm uppercase tracking-wide',
                      isEdit && 'bg-brand-gray',
                    )}
                  />
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductCodeError('');
                        setProductCode(generateProductCode());
                      }}
                      className="shrink-0 whitespace-nowrap text-xs font-medium text-brand-primary hover:underline"
                    >
                      ↻ Sinh mã
                    </button>
                  )}
                </div>
              </AdminField>
            </div>
          </FormCard>

          <FormCard title="Tuỳ chọn nâng cao">
            <div className="space-y-3">
              <AdminField label="Thương hiệu" layout="row">
                <AdminInput
                  {...register('brand')}
                  type="text"
                  placeholder="GreenMate"
                  className="h-9 min-h-9 px-2.5 text-sm"
                />
              </AdminField>
              <AdminField label="Xuất xứ" layout="row">
                <AdminInput
                  {...register('origin')}
                  type="text"
                  placeholder="Việt Nam"
                  className="h-9 min-h-9 px-2.5 text-sm"
                />
              </AdminField>
              <AdminField label="Loại badge" layout="row">
                <AdminSelect
                  {...badgeTypeField}
                  className="h-9 min-h-9 px-2.5 text-sm"
                  onChange={(e) => {
                    badgeTypeField.onChange(e);
                    const val = e.target.value;
                    if (!val) {
                      setValue('badge_text', '');
                      return;
                    }
                    if (val !== 'custom') {
                      const opt = PRODUCT_BADGE_TYPE_OPTIONS.find((o) => o.value === val);
                      if (opt) setValue('badge_text', opt.label);
                    }
                  }}
                >
                  <option value="">— Không có —</option>
                  {PRODUCT_BADGE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <AdminField
                label="Nội dung badge"
                layout="row"
                hint={
                  badgeType === 'custom'
                    ? 'Nhập nội dung hiển thị trên badge'
                    : badgeType
                      ? 'Tự điền theo loại — có thể sửa lại'
                      : undefined
                }
              >
                <AdminInput
                  {...register('badge_text')}
                  type="text"
                  disabled={!badgeType}
                  className="h-9 min-h-9 px-2.5 text-sm"
                  placeholder={
                    badgeType === 'custom'
                      ? 'VD: Ưu đãi mùa hè'
                      : 'Chọn loại badge trước'
                  }
                />
              </AdminField>
              <AdminField
                label="Voucher"
                layout="row"
                hint={
                  voucherLockedToApplied
                    ? 'Voucher đang áp dụng vào giá — nhãn marketing đồng bộ tự động. Đổi scope tại mục Voucher.'
                    : 'Voucher active, áp dụng toàn shop'
                }
              >
                {voucherOptions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-brand-gray/40 px-2.5 py-2 text-[11px] leading-snug text-gray-500">
                    {voucherLockedToApplied
                      ? 'Voucher đang áp dụng qua scope SKU/sản phẩm.'
                      : 'Không có voucher toàn shop đang active.'}{' '}
                    <Link href="/vouchers" className="font-medium text-brand-primary hover:underline">
                      Quản lý voucher →
                    </Link>
                  </div>
                ) : (
                  <>
                    <AdminSelect
                      {...register('voucher_code')}
                      disabled={voucherLockedToApplied}
                      className="h-9 min-h-9 px-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <option value="">— Không hiển thị —</option>
                      {voucherOptions.map((voucher) => (
                        <option key={voucher.id} value={voucher.code}>
                          {formatEligibleVoucherOptionLabel(voucher)}
                        </option>
                      ))}
                    </AdminSelect>
                    {staleVoucherCode && !selectedVoucherCode && (
                      <p className="mt-1 text-[11px] leading-snug text-amber-700">
                        Mã cũ &quot;{staleVoucherCode}&quot; không còn hợp lệ — chọn lại hoặc để trống khi lưu.
                      </p>
                    )}
                    {selectedVoucher && (
                      <p className="mt-1 text-[11px] leading-snug text-gray-500">
                        {selectedVoucher.description}
                        {selectedVoucher.minOrder > 0 && (
                          <span>
                            {' '}
                            · Đơn tối thiểu {selectedVoucher.minOrder.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </p>
                    )}
                  </>
                )}
              </AdminField>
            </div>
          </FormCard>
        </aside>

        {/* Main workflow */}
        <div className="order-2 min-w-0 space-y-5 lg:order-1">
          <FormCard title="Thông tin cơ bản">
            <AdminField label="Tên sản phẩm" required error={errors.product_name?.message}>
              <AdminInput
                {...register('product_name')}
                type="text"
                placeholder="VD: Hạt Điều Rang Muối GreenMate 250g"
                error={Boolean(errors.product_name)}
              />
            </AdminField>

            <AdminField label="Mô tả" error={errors.product_descriptions?.message}>
              <AdminTextarea
                {...register('product_descriptions')}
                rows={4}
                placeholder="Mô tả ngắn về sản phẩm…"
                error={Boolean(errors.product_descriptions)}
                className="resize-y max-h-64"
              />
            </AdminField>
          </FormCard>

          <FormCard
            title="Thông tin chi tiết"
            badge="Tuỳ chọn"
          >
            <p className="mb-3 text-xs leading-relaxed text-gray-500">
              Các mục dưới đây hiển thị trên trang chi tiết sản phẩm. Áp dụng chung cho mọi loại sản phẩm — không bắt buộc khi tạo.
            </p>
            <ProductDetailAttributesFields register={register} errors={errors} />
          </FormCard>

          <FormCard
            title="Phân loại (Variations)"
            badge={variations.length > 0 ? `${variations.length}/3` : undefined}
          >
            <VariationEditor variations={variations} onChange={setVariations} />
          </FormCard>

          <FormCard
            title="Tùy Chỉnh Phân Loại"
            badge={skus.length > 0 ? `${skus.length} SKU` : undefined}
          >
            <SkuMatrix
              variations={variations}
              skus={skus}
              productCode={productCode}
              isEdit={isEdit}
              onSkuChange={setSkus}
              showRecipeErrors={showSkuRecipeErrors}
            />
          </FormCard>
        </div>
      </div>

      <FormStickyActions
        isPending={isPending}
        locked={submitDone}
        onCancel={() => router.back()}
        cancelLabel={isEdit ? 'Trở lại' : 'Hủy'}
      >
        {isEdit ? (
          <>
            <FormSubmitButton
              pending={isPending}
              done={submitDone}
              disabled={!hasEditChanges}
              onClick={onSaveDraft}
            >
              Lưu thay đổi
            </FormSubmitButton>
            {status === 'draft' && (
              <FormSubmitButtonOutline
                pending={isPending}
                done={submitDone}
                disabled={!hasEditChanges}
                onClick={onPublish}
              >
                Lưu & đăng bán
              </FormSubmitButtonOutline>
            )}
          </>
        ) : (
          <>
            <FormSubmitButtonOutline pending={isPending} done={submitDone} onClick={onSaveDraft}>
              Lưu nháp
            </FormSubmitButtonOutline>
            <FormSubmitButton pending={isPending} done={submitDone} onClick={onPublish}>
              Đăng bán ngay
            </FormSubmitButton>
          </>
        )}
      </FormStickyActions>
    </div>
  );
}
