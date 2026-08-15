'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateIngredientInfoAction } from '@/lib/actions/ingredient';
import { INGREDIENT_UNITS, ingredientInfoSchema } from '@/lib/ingredients/ingredientSchema';
import { formatIngredientName } from '@/lib/ingredients/ingredientDisplay';
import { showError, showSuccess } from '@/lib/shared/toast';
import { AdminButtonOutline, AdminField, AdminInput, AdminSelect } from '@/components/admin';

/**
 * @param {{ ingredientId: string, ingredient: object }} props
 */
export default function IngredientEditForm({ ingredientId, ingredient }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ingredientInfoSchema),
    defaultValues: {
      name: formatIngredientName(ingredient.ingredient_name),
      unit: ingredient.ingredient_unit ?? 'g',
      location: ingredient.ingredient_location ?? 'Kho chính',
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const res = await updateIngredientInfoAction(ingredientId, values);
      if (res?.error) {
        showError('Cập nhật thất bại', res.error);
        return;
      }
      if (res?.fieldErrors) {
        const msg = Object.values(res.fieldErrors).flat()[0];
        showError('Dữ liệu không hợp lệ', msg);
        return;
      }
      showSuccess('Đã lưu', res.message ?? 'Cập nhật thông tin nguyên liệu');
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AdminField label="Tên hiển thị" required error={errors.name?.message}>
        <AdminInput {...register('name')} error={Boolean(errors.name)} />
      </AdminField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminField label="Đơn vị" required error={errors.unit?.message}>
          <AdminSelect {...register('unit')} error={Boolean(errors.unit)}>
            {INGREDIENT_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </AdminSelect>
        </AdminField>

        <AdminField label="Vị trí kho" required error={errors.location?.message}>
          <AdminInput {...register('location')} error={Boolean(errors.location)} />
        </AdminField>
      </div>

      <AdminButtonOutline type="submit" disabled={isPending}>
        {isPending ? 'Đang lưu…' : 'Lưu thông tin'}
      </AdminButtonOutline>
    </form>
  );
}
