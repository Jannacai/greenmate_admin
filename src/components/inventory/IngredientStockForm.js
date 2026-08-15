'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addIngredientStockAction } from '@/lib/actions/ingredient';
import {
  costInputToPerBaseUnit,
  ingredientDisplayUnit,
  isWeightGramUnit,
  stockInputToGrams,
} from '@/lib/ingredients/ingredientDisplay';
import { INGREDIENT_UNITS, ingredientStockSchema } from '@/lib/ingredients/ingredientSchema';
import { showError, showSuccess } from '@/lib/shared/toast';
import { formatVndInput, parseVndInput, cn } from '@/lib/shared/utils';
import { AdminButton, AdminField, AdminInput, AdminSelect } from '@/components/admin';

/**
 * Form nhập kho — tạo mới hoặc cộng dồn theo tên.
 */
export default function IngredientStockForm({
  defaultName = '',
  defaultUnit = 'g',
  defaultLocation = 'Kho chính',
  lockName = false,
  redirectToDetail = true,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ingredientStockSchema),
    defaultValues: {
      ingredientName: defaultName,
      stock: 0,
      unit: defaultUnit === 'ml' || defaultUnit === 'cái' ? defaultUnit : 'g',
      cost: 0,
      location: defaultLocation,
    },
  });

  const unitValue = watch('unit');
  const costValue = watch('cost');
  const isKgInput = isWeightGramUnit(unitValue);

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      stock: stockInputToGrams(values.stock, values.unit),
      cost: costInputToPerBaseUnit(values.cost, values.unit),
    };

    startTransition(async () => {
      const res = await addIngredientStockAction(payload);
      if (res?.error) {
        showError('Nhập kho thất bại', res.error);
        return;
      }
      if (res?.fieldErrors) {
        const msg = Object.values(res.fieldErrors).flat()[0];
        showError('Dữ liệu không hợp lệ', msg);
        return;
      }

      showSuccess('Nhập kho thành công', res.message ?? 'Đã cập nhật tồn kho');
      if (redirectToDetail && res?.id) {
        router.push(`/inventory/${res.id}`);
      } else {
        router.refresh();
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AdminField label="Tên nguyên liệu" required error={errors.ingredientName?.message}>
        <AdminInput
          {...register('ingredientName')}
          readOnly={lockName}
          placeholder="VD: Hạt điều rang muối"
          error={Boolean(errors.ingredientName)}
          className={cn(lockName && 'bg-brand-gray text-gray-600 cursor-default')}
        />
        {!lockName && (
          <p className="text-xs text-gray-400">Trùng tên → cộng dồn tồn kho, không tạo bản ghi mới.</p>
        )}
      </AdminField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminField
          label={isKgInput ? 'Số lượng nhập (kg)' : 'Số lượng nhập'}
          required
          error={errors.stock?.message}
        >
          <AdminInput
            {...register('stock', { valueAsNumber: true })}
            type="number"
            min={isKgInput ? 0.001 : 1}
            step={isKgInput ? 0.001 : 1}
            placeholder={isKgInput ? '1' : '100'}
            error={Boolean(errors.stock)}
          />
          {isKgInput && (
            <p className="text-xs text-gray-400">Nhập theo kilogram — hệ thống lưu nội bộ theo gam.</p>
          )}
        </AdminField>

        <AdminField label="Đơn vị" required error={errors.unit?.message}>
          <AdminSelect {...register('unit')} error={Boolean(errors.unit)}>
            {INGREDIENT_UNITS.map((u) => (
              <option key={u} value={u}>
                {ingredientDisplayUnit(u)}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminField
          label={isKgInput ? 'Giá vốn / kg (VND)' : 'Giá vốn / đơn vị (VND)'}
          error={errors.cost?.message}
        >
          <AdminInput
            type="text"
            inputMode="numeric"
            value={formatVndInput(costValue)}
            onChange={(e) => setValue('cost', parseVndInput(e.target.value), { shouldValidate: true })}
            placeholder="120"
            error={Boolean(errors.cost)}
          />
        </AdminField>

        <AdminField label="Vị trí kho" required error={errors.location?.message}>
          <AdminInput
            {...register('location')}
            placeholder="Tủ đông số 1"
            error={Boolean(errors.location)}
          />
        </AdminField>
      </div>

      <AdminButton type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Đang lưu…' : 'Xác nhận nhập kho'}
      </AdminButton>
    </form>
  );
}
