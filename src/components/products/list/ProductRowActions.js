'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteProductAction,
  publishProductAction,
  unpublishProductAction,
} from '@/lib/actions/product';
import { showError, showSuccess } from '@/lib/shared/toast';
import { cn } from '@/lib/shared/utils';

/**
 * Nút sửa / publish / unpublish / xóa trên từng dòng sản phẩm.
 *
 * @param {{
 *   productId: string,
 *   productName?: string,
 *   status: 'published' | 'draft',
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   layout?: 'row' | 'stack',
 *   className?: string,
 * }} props
 */
export default function ProductRowActions({
  productId,
  productName = 'sản phẩm này',
  status,
  canUpdate = false,
  canDelete = false,
  layout = 'row',
  className,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const res = await publishProductAction(productId);
      if (res.error) {
        showError('Đăng bán thất bại', res.error);
        return;
      }
      showSuccess('Đã đăng bán sản phẩm');
      router.refresh();
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const res = await unpublishProductAction(productId);
      if (res.error) {
        showError('Gỡ bán thất bại', res.error);
        return;
      }
      showSuccess('Đã chuyển sản phẩm sang nháp');
      router.refresh();
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Xóa "${productName}" khỏi catalog? Hành động không thể hoàn tác. Sản phẩm đã có đơn hàng sẽ không xóa được.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteProductAction(productId, { fromList: true });
      if (res?.error) {
        showError('Xóa thất bại', res.error);
        return;
      }
      showSuccess('Đã xóa sản phẩm');
      router.refresh();
    });
  }

  const editHref = `/products/${productId}/edit?status=${status}`;

  const btnClass =
    'rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';

  const editButton = canUpdate ? (
    <Link
      href={editHref}
      className={cn(btnClass, 'border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5')}
    >
      Sửa
    </Link>
  ) : null;

  const publishButton = canUpdate ? (
    status === 'draft' ? (
      <button
        type="button"
        disabled={isPending}
        onClick={handlePublish}
        className={cn(
          btnClass,
          'border border-brand-primary bg-brand-primary text-white hover:bg-brand-primary/90',
        )}
      >
        {isPending ? '…' : 'Đăng bán'}
      </button>
    ) : (
      <button
        type="button"
        disabled={isPending}
        onClick={handleUnpublish}
        className={cn(
          btnClass,
          'border border-amber-400 text-amber-700 hover:bg-amber-50',
        )}
      >
        {isPending ? '…' : 'Gỡ bán'}
      </button>
    )
  ) : null;

  const deleteButton = canDelete ? (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className={cn(btnClass, 'border border-red-200 text-red-600 hover:bg-red-50')}
    >
      {isPending ? '…' : 'Xóa'}
    </button>
  ) : null;

  if (layout === 'row') {
    return (
      <div className={cn('flex flex-wrap items-center justify-center gap-1', className)}>
        {editButton}
        {publishButton}
        {deleteButton}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {editButton}
      {publishButton}
      {deleteButton}
    </div>
  );
}
