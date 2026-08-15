'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { voucherSchema } from '@/lib/vouchers/voucherSchema';
import { createVoucherAction, updateVoucherAction, getNarrowVoucherProductLocksAction } from '@/lib/actions/discount';
import { showError, showSuccess } from '@/lib/shared/toast';
import VoucherProductPicker from '@/components/vouchers/VoucherProductPicker';
import { cn, formatVndInput, parseVndInput } from '@/lib/shared/utils';
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
 * @param {string|Date|undefined} value
 */
function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * @param {{
 *   mode: 'create' | 'edit',
 *   discountId?: string,
 *   initial?: object | null,
 *   canSubmit?: boolean,
 *   cancelHref?: string,
 * }} props
 */
export default function VoucherForm({
  mode,
  discountId,
  initial = null,
  canSubmit = true,
  cancelHref = '/vouchers',
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const actionFn =
    isEdit && discountId
      ? updateVoucherAction.bind(null, discountId)
      : createVoucherAction;

  const [state, formAction] = useActionState(actionFn, null);
  const [isPending, startTransition] = useTransition();
  const [selectedProducts, setSelectedProducts] = useState(
    () => (initial?.discount_product_ids ?? []).map(String),
  );
  const [narrowLocksByProduct, setNarrowLocksByProduct] = useState({});

  useEffect(() => {
    startTransition(async () => {
      const res = await getNarrowVoucherProductLocksAction(isEdit ? discountId : undefined);
      if (res?.by_product) {
        setNarrowLocksByProduct(res.by_product);
      }
    });
  }, [isEdit, discountId]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      name: initial?.discount_name ?? '',
      description: initial?.discount_description ?? '',
      code: initial?.discount_code ?? '',
      type: initial?.discount_type ?? 'percentage',
      value: initial?.discount_value ?? 10,
      start_date: toDatetimeLocal(initial?.discount_start_date) || '',
      end_date: toDatetimeLocal(initial?.discount_end_date) || '',
      is_active: initial?.discount_is_active ?? true,
      max_uses: initial?.discount_max_uses ?? 100,
      max_uses_per_user: initial?.discount_max_uses_per_user ?? 1,
      min_order_value: initial?.discount_min_order_value ?? 0,
      applies_to: initial?.discount_applies_to === 'specific_sku'
        ? 'specific'
        : (initial?.discount_applies_to ?? 'all'),
      product_ids: (initial?.discount_product_ids ?? []).map(String),
      sku_ids: [],
    },
  });

  const appliesTo = watch('applies_to');
  const discountType = watch('type');
  const minOrderValue = watch('min_order_value');
  const isActive = watch('is_active');
  const canSave = !isEdit || isDirty;

  useEffect(() => {
    setValue('product_ids', selectedProducts, { shouldDirty: true });
  }, [selectedProducts, setValue]);

  useEffect(() => {
    if (state?.error) {
      showError('Không lưu được voucher', state.error);
    }
  }, [state?.error]);

  useEffect(() => {
    if (!state?.success) return;

    if (mode === 'create') {
      showSuccess('Đã tạo voucher thành công');
      router.push(state.discountId ? `/vouchers/${state.discountId}` : '/vouchers');
      return;
    }

    showSuccess(state.message ?? 'Đã cập nhật voucher');
    router.push(discountId ? `/vouchers/${discountId}` : '/vouchers');
  }, [state?.success, state?.message, state?.discountId, mode, discountId, router]);

  function onSubmit(data) {
    if (isEdit && !isDirty) return;

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

  const scopeCount = appliesTo === 'specific' ? selectedProducts.length : 0;

  return (
    <div className="pb-24 lg:pb-0">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(350px,380px)] lg:items-start">
          <div className="min-w-0 space-y-4">
            <FormCard title="Thông tin cơ bản" compact>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <AdminField label="Tên voucher" required error={fieldError('name')} compact>
                  <AdminInput
                    {...register('name')}
                    error={Boolean(fieldError('name'))}
                    placeholder="Giảm 10% mùa hè"
                    disabled={!canSubmit}
                  />
                </AdminField>

                <AdminField label="Mã voucher" required error={fieldError('code')} compact>
                  <AdminInput
                    {...register('code')}
                    error={Boolean(fieldError('code'))}
                    className="font-mono uppercase tracking-wide"
                    placeholder="SUMMER10"
                    disabled={!canSubmit}
                  />
                </AdminField>
              </div>

              <AdminField label="Mô tả" error={fieldError('description')} compact>
                <AdminTextarea
                  {...register('description')}
                  rows={2}
                  error={Boolean(fieldError('description'))}
                  placeholder="VD: Áp dụng cho đơn từ 200.000đ"
                  disabled={!canSubmit}
                  className="resize-y min-h-[56px] max-h-32"
                />
              </AdminField>
            </FormCard>

            <FormCard
              title="Phạm vi áp dụng"
              required
              compact
              badge={
                appliesTo === 'all'
                  ? 'Toàn shop'
                  : scopeCount > 0
                    ? `${scopeCount} SP`
                    : undefined
              }
            >
              <AdminField label="Loại phạm vi" error={fieldError('applies_to')} compact>
                <SegmentGroup
                  value={appliesTo}
                  disabled={!canSubmit}
                  options={[
                    { value: 'all', label: 'Toàn shop' },
                    { value: 'specific', label: 'Theo sản phẩm' },
                  ]}
                  onChange={(val) => setValue('applies_to', val, { shouldValidate: true, shouldDirty: true })}
                />
                <input type="hidden" {...register('applies_to')} />
              </AdminField>

              {appliesTo === 'specific' && (
                <div className="border-t border-gray-100 pt-2.5">
                  {fieldError('product_ids') && (
                    <p className="mb-2 text-xs text-red-600">{fieldError('product_ids')}</p>
                  )}
                  <VoucherProductPicker
                    selectedIds={selectedProducts}
                    onChange={setSelectedProducts}
                    disabled={!canSubmit}
                    narrowLocksByProduct={narrowLocksByProduct}
                    density="compact"
                  />
                </div>
              )}
            </FormCard>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-4">
            <FormCard title="Giá trị & hiệu lực" compact>
              <div className="space-y-2">
                <AdminField label="Loại giảm" error={fieldError('type')} layout="row" compact>
                  <SegmentGroup
                    value={discountType}
                    disabled={!canSubmit}
                    options={[
                      { value: 'percentage', label: '%' },
                      { value: 'fixed_amount', label: 'Số tiền' },
                    ]}
                    onChange={(val) => setValue('type', val, { shouldValidate: true, shouldDirty: true })}
                  />
                  <input type="hidden" {...register('type')} />
                </AdminField>

                <AdminField
                  label={discountType === 'percentage' ? 'Phần trăm' : 'Số tiền'}
                  error={fieldError('value')}
                  layout="row"
                  compact
                >
                  <div className="relative">
                    <AdminInput
                      type="number"
                      step={discountType === 'percentage' ? '1' : '1000'}
                      min={0}
                      {...register('value')}
                      error={Boolean(fieldError('value'))}
                      disabled={!canSubmit}
                      className={cn(
                        discountType === 'percentage' ? 'pr-8' : 'pr-9 text-right tabular-nums',
                      )}
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      {discountType === 'percentage' ? '%' : 'đ'}
                    </span>
                  </div>
                </AdminField>

                <AdminField
                  label="Đơn tối thiểu"
                  error={fieldError('min_order_value')}
                  hint="0 = không yêu cầu"
                  layout="row"
                  compact
                >
                  <div
                    className={cn(
                      'flex min-h-[36px] items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5',
                      'focus-within:ring-2 focus-within:ring-brand-primary/50',
                      fieldError('min_order_value') ? 'border-red-300' : 'border-gray-300',
                      !canSubmit && 'bg-gray-50 opacity-60',
                    )}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      disabled={!canSubmit}
                      placeholder="0"
                      value={formatVndInput(minOrderValue)}
                      onChange={(e) => {
                        setValue('min_order_value', parseVndInput(e.target.value), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      className="min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-sm text-brand-dark tabular-nums focus:outline-none disabled:cursor-not-allowed"
                    />
                    <span className="shrink-0 text-xs text-gray-500">đ</span>
                  </div>
                </AdminField>

                <AdminField label="Bắt đầu" error={fieldError('start_date')} layout="row" compact>
                  <AdminInput
                    type="datetime-local"
                    {...register('start_date')}
                    error={Boolean(fieldError('start_date'))}
                    disabled={!canSubmit}
                    className="text-xs"
                  />
                </AdminField>

                <AdminField label="Kết thúc" error={fieldError('end_date')} layout="row" compact>
                  <AdminInput
                    type="datetime-local"
                    {...register('end_date')}
                    error={Boolean(fieldError('end_date'))}
                    disabled={!canSubmit}
                    className="text-xs"
                  />
                </AdminField>

                <div className="grid grid-cols-2 gap-2">
                  <AdminField label="Tổng lượt" error={fieldError('max_uses')} compact>
                    <AdminInput
                      type="number"
                      min={1}
                      {...register('max_uses')}
                      error={Boolean(fieldError('max_uses'))}
                      disabled={!canSubmit}
                      className="text-center tabular-nums"
                    />
                  </AdminField>
                  <AdminField label="/ khách" error={fieldError('max_uses_per_user')} compact>
                    <AdminInput
                      type="number"
                      min={1}
                      {...register('max_uses_per_user')}
                      error={Boolean(fieldError('max_uses_per_user'))}
                      disabled={!canSubmit}
                      className="text-center tabular-nums"
                    />
                  </AdminField>
                </div>

                <FormPublishToggle
                  register={register}
                  isActive={isActive}
                  isEdit={isEdit}
                  disabled={!canSubmit}
                  activeTitle="Voucher đang bật"
                  createTitle="Kích hoạt ngay"
                  activeHint="Bỏ chọn để tắt — hoặc dùng nút nhanh ở trang chi tiết"
                  createHint="Bỏ chọn để lưu dạng tắt, bật sau từ danh sách"
                  className="p-2.5"
                />
              </div>
            </FormCard>
          </aside>
        </div>

        {canSubmit && (
          <FormStickyActions
            isPending={isPending}
            onCancel={() => router.push(cancelHref)}
            cancelLabel={isEdit ? 'Hủy' : 'Quay lại'}
          >
            <AdminButton
              type="submit"
              disabled={isPending || !canSave}
              title={isEdit && !isDirty ? 'Chưa có thay đổi để lưu' : undefined}
              className="min-h-[44px] px-5"
            >
              {isPending
                ? isEdit
                  ? 'Đang lưu…'
                  : 'Đang tạo…'
                : isEdit
                  ? 'Lưu thay đổi'
                  : 'Tạo voucher'}
            </AdminButton>
          </FormStickyActions>
        )}
      </form>
    </div>
  );
}

/**
 * @param {{
 *   value: string,
 *   options: Array<{ value: string, label: string }>,
 *   onChange: (value: string) => void,
 *   disabled?: boolean,
 * }} props
 */
function SegmentGroup({ value, options, onChange, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            'min-h-[36px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
            value === opt.value
              ? 'border-brand-primary bg-brand-primary text-white'
              : 'border-gray-300 bg-white text-gray-600 hover:border-brand-primary hover:text-brand-primary',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
