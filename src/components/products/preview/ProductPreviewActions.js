'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteProductAction,
  publishProductAction,
  unpublishProductAction,
} from '@/lib/actions/product';
import { showError } from '@/lib/shared/toast';
import {
  AdminButton,
  AdminButtonGhost,
  AdminButtonOutline,
  FormStickyActions,
} from '@/components/admin';
import { cn } from '@/lib/shared/utils';

/**
 * Hành động trên trang chi tiết sản phẩm.
 *
 * @param {{
 *   productId: string,
 *   productName?: string,
 *   status?: 'published' | 'draft',
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   placement?: 'footer' | 'header',
 * }} props
 */
export default function ProductPreviewActions({
  productId,
  productName = 'sản phẩm này',
  status = 'draft',
  canUpdate = false,
  canDelete = false,
  placement = 'footer',
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const res = await publishProductAction(productId);
      if (!res.error) router.refresh();
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const res = await unpublishProductAction(productId);
      if (!res.error) router.refresh();
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
      const res = await deleteProductAction(productId);
      if (res?.error) {
        showError('Xóa thất bại', res.error);
      }
    });
  }

  const editHref = `/products/${productId}/edit?status=${status}`;
  const isHeader = placement === 'header';
  const actionTextClass = 'text-[calc(1rem-2px)]';

  return (
    <FormStickyActions
      isPending={isPending}
      cancelLabel="Danh sách"
      onCancel={() => router.push('/products')}
      buttonClassName={actionTextClass}
      className={cn(
        isHeader
          ? 'static inset-auto bottom-auto z-auto flex w-full shrink-0 items-center border-0 bg-transparent p-0 backdrop-blur-none sm:w-auto lg:mt-0 lg:border-0 lg:py-0 [&>div]:mx-0 [&>div]:max-w-none'
          : 'lg:py-0',
      )}
    >
      {canUpdate && (
        <Link href={editHref} className="inline-flex items-center">
          <AdminButtonOutline type="button" className={actionTextClass}>Sửa</AdminButtonOutline>
        </Link>
      )}

      {canUpdate && (status === 'draft' ? (
        <AdminButton
          type="button"
          disabled={isPending}
          onClick={handlePublish}
          className={cn(
            actionTextClass,
            'border-brand-primary bg-brand-primary text-white hover:bg-brand-primary/90',
          )}
        >
          {isPending ? 'Đang xử lý…' : 'Đăng bán'}
        </AdminButton>
      ) : (
        <AdminButton
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleUnpublish}
          className={cn(
            actionTextClass,
            'border-amber-400 bg-amber-400 text-brand-dark hover:border-amber-500 hover:bg-amber-500 hover:text-brand-dark',
          )}
        >
          {isPending ? 'Đang xử lý…' : 'Gỡ bán'}
        </AdminButton>
      ))}

      {canDelete && (
        <AdminButtonGhost
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className={cn(
            actionTextClass,
            'text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700',
          )}
        >
          {isPending ? 'Đang xử lý…' : 'Xóa sản phẩm'}
        </AdminButtonGhost>
      )}
    </FormStickyActions>
  );
}
