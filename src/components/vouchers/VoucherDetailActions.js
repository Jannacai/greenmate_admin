'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteVoucherAction,
  publishVoucherAction,
  unpublishVoucherAction,
} from '@/lib/actions/discount';
import { getVoucherLifecycleStatus } from '@/lib/vouchers/voucherSchema';
import { showError, showSuccess } from '@/lib/shared/toast';
import {
  AdminButton,
  AdminButtonGhost,
  AdminButtonOutline,
  FormStickyActions,
} from '@/components/admin';
import { cn } from '@/lib/shared/utils';

/**
 * Hành động trên trang chi tiết voucher — đồng bộ pattern với ProductPreviewActions.
 *
 * @param {{
 *   code: string,
 *   discountId: string,
 *   discount: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   placement?: 'footer' | 'header',
 * }} props
 */
export default function VoucherDetailActions({
  code,
  discountId,
  discount,
  canUpdate = false,
  canDelete = false,
  placement = 'header',
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const lifecycle = discount ? getVoucherLifecycleStatus(discount) : 'inactive';
  const isActive = discount?.discount_is_active === true;
  const isExpired = lifecycle === 'expired';
  const canPublish = canUpdate && !isActive && !isExpired;
  const canUnpublish = canUpdate && isActive && !isExpired;
  const showRenewAction = canUpdate && !isActive && isExpired;

  function handlePublish() {
    startTransition(async () => {
      const res = await publishVoucherAction(discountId);
      if (res?.error) {
        showError('Kích hoạt thất bại', res.error);
        return;
      }
      showSuccess('Đã kích hoạt voucher');
      router.refresh();
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const res = await unpublishVoucherAction(discountId);
      if (res?.error) {
        showError('Tắt voucher thất bại', res.error);
        return;
      }
      showSuccess('Đã tắt voucher');
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`Xóa voucher "${code}"? Hành động không thể hoàn tác.`)) return;

    startTransition(async () => {
      const res = await deleteVoucherAction(code);
      if (res?.error) {
        showError('Xóa voucher thất bại', res.error);
      }
    });
  }

  const editHref = `/vouchers/${discountId}/edit`;
  const isHeader = placement === 'header';

  return (
    <FormStickyActions
      isPending={isPending}
      cancelLabel="Danh sách"
      onCancel={() => router.push('/vouchers')}
      className={cn(
        isHeader
          ? 'static inset-auto bottom-auto z-auto w-full shrink-0 border-0 bg-transparent p-0 backdrop-blur-none sm:w-auto lg:mt-0 lg:border-0 lg:py-0'
          : 'lg:py-0',
      )}
    >
      {canUpdate && (
        <Link href={editHref} className="inline-flex">
          <AdminButtonOutline type="button">Sửa</AdminButtonOutline>
        </Link>
      )}

      {showRenewAction && (
        <Link href={editHref} className="inline-flex">
          <AdminButtonOutline
            type="button"
            title="Chỉnh sửa và gia hạn ngày kết thúc trước khi kích hoạt lại"
            className="border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
          >
            Gia hạn
          </AdminButtonOutline>
        </Link>
      )}

      {canPublish && (
        <AdminButton
          type="button"
          disabled={isPending}
          onClick={handlePublish}
          className="border-brand-primary bg-brand-primary text-white hover:bg-brand-primary/90"
        >
          {isPending ? 'Đang xử lý…' : 'Kích hoạt'}
        </AdminButton>
      )}

      {canUnpublish && (
        <AdminButton
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleUnpublish}
          className="border-amber-400 bg-amber-400 text-brand-dark hover:border-amber-500 hover:bg-amber-500 hover:text-brand-dark"
        >
          {isPending ? 'Đang xử lý…' : 'Tắt'}
        </AdminButton>
      )}

      {canDelete && (
        <AdminButtonGhost
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          {isPending ? 'Đang xử lý…' : 'Xóa voucher'}
        </AdminButtonGhost>
      )}
    </FormStickyActions>
  );
}
