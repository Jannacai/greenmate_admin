'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { deleteIngredientAction } from '@/lib/actions/ingredient';
import { showError } from '@/lib/shared/toast';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{
 *   ingredientId: string,
 *   name: string,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   layout?: 'row' | 'stack',
 *   compact?: boolean,
 * }} props
 */
export default function IngredientRowActions({
  ingredientId,
  name,
  canUpdate = false,
  canDelete = false,
  layout = 'row',
  compact = false,
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Xóa nguyên liệu "${name}" khỏi kho? Hành động không thể hoàn tác.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteIngredientAction(ingredientId);
      if (res?.error) {
        showError('Xóa thất bại', res.error);
      }
    });
  }

  const btnClass = cn(
    'inline-flex items-center justify-center rounded-md border font-medium transition-colors disabled:opacity-50 whitespace-nowrap',
    compact ? 'px-1.5 py-1 text-[11px]' : 'min-h-[34px] px-3 py-1.5 text-xs',
  );

  const topRowClass =
    layout === 'stack'
      ? 'flex items-stretch gap-1.5'
      : 'flex items-center justify-end gap-1.5';

  const importBtnClass = cn(
    btnClass,
    'border-brand-primary bg-brand-primary text-white hover:bg-brand-primary/90',
    layout === 'stack' && 'w-full',
  );

  return (
    <div className={cn('flex flex-col gap-1.5', layout === 'row' && 'items-end')}>
      {(canUpdate || canDelete) && (
        <div className={topRowClass}>
          {canUpdate && (
            <Link
              href={`/inventory/${ingredientId}/edit`}
              className={cn(
                btnClass,
                'border-brand-primary/30 bg-white text-brand-primary hover:bg-brand-primary/5',
                layout === 'stack' && 'flex-1',
              )}
            >
              Sửa
            </Link>
          )}

          {canDelete && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className={cn(
                btnClass,
                'border-red-200 bg-white text-red-600 hover:bg-red-50',
                layout === 'stack' && 'flex-1',
              )}
            >
              Xóa
            </button>
          )}
        </div>
      )}

      {canUpdate && (
        <Link href={`/inventory/${ingredientId}/stock`} className={importBtnClass}>
          Nhập thêm
        </Link>
      )}
    </div>
  );
}
