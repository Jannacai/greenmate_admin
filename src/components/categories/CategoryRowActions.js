'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  deleteCategoryAction,
  publishCategoryAction,
  unpublishCategoryAction,
} from '@/lib/actions/category';
import { getCategoryLifecycleStatus } from '@/lib/categories/categorySchema';
import { showError, showSuccess } from '@/lib/shared/toast';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{
 *   categoryId: string,
 *   category: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   compact?: boolean,
 * }} props
 */
export default function CategoryRowActions({
  categoryId,
  category,
  canUpdate = false,
  canDelete = false,
  compact = false,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const status = getCategoryLifecycleStatus(category);
  const isActive = status === 'active';

  function handlePublish() {
    startTransition(async () => {
      const res = await publishCategoryAction(categoryId);
      if (res?.error) {
        showError('Kích hoạt thất bại', res.error);
        return;
      }
      showSuccess('Đã hiển thị loại sản phẩm');
      router.refresh();
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const res = await unpublishCategoryAction(categoryId);
      if (res?.error) {
        showError('Ẩn danh mục thất bại', res.error);
        return;
      }
      showSuccess('Đã ẩn loại sản phẩm');
      router.refresh();
    });
  }

  function handleDelete() {
    const name = category?.category_name ?? 'danh mục';
    if (!window.confirm(`Xóa "${name}"? Hành động không thể hoàn tác.`)) return;

    startTransition(async () => {
      const res = await deleteCategoryAction(categoryId);
      if (res?.error) showError('Xóa thất bại', res.error);
    });
  }

  const btnClass = cn(
    'rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap',
    compact ? 'px-1.5 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs font-semibold',
  );

  return (
    <div className={cn('flex flex-wrap items-center justify-end gap-1.5', compact && 'gap-1')}>
      {canUpdate && isActive === false && (
        <button
          type="button"
          disabled={isPending}
          onClick={handlePublish}
          className={cn(btnClass, 'border border-brand-primary bg-brand-primary text-white')}
        >
          Hiện
        </button>
      )}
      {canUpdate && isActive && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleUnpublish}
          className={cn(btnClass, 'border border-amber-400 bg-amber-400 text-brand-dark')}
        >
          Ẩn
        </button>
      )}
      {canUpdate && (
        <Link
          href={`/categories/${categoryId}/edit`}
          className={cn(btnClass, 'border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5')}
        >
          Sửa
        </Link>
      )}
      {canDelete && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className={cn(btnClass, 'border border-red-200 text-red-600 hover:bg-red-50')}
        >
          Xóa
        </button>
      )}
    </div>
  );
}
