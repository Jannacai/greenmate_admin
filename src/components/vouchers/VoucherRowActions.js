'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  deleteVoucherAction,
  publishVoucherAction,
  unpublishVoucherAction,
} from '@/lib/actions/discount';
import { getVoucherLifecycleStatus } from '@/lib/vouchers/voucherSchema';
import { showError, showSuccess } from '@/lib/shared/toast';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{
 *   code: string,
 *   discountId: string,
 *   discount: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   layout?: 'row' | 'stack',
 *   hideDetailLink?: boolean,
 *   compact?: boolean,
 * }} props
 */
export default function VoucherRowActions({
  code,
  discountId,
  discount,
  canUpdate = false,
  canDelete = false,
  layout = 'row',
  hideDetailLink = false,
  compact = false,
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
        return;
      }
      showSuccess('Đã xóa voucher');
      router.push('/vouchers');
    });
  }

  const editHref = `/vouchers/${discountId}/edit`;
  const detailHref = `/vouchers/${discountId}`;

  const btnClass = cn(
    'rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap',
    compact ? 'px-1.5 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs font-semibold',
  );

  const editButton = canUpdate ? (
    <Link
      href={editHref}
      className={cn(
        btnClass,
        'border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5',
      )}
    >
      Sửa
    </Link>
  ) : null;

  const detailButton = !hideDetailLink ? (
    <Link
      href={detailHref}
      className={cn(
        btnClass,
        'border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-brand-dark',
      )}
    >
      Chi tiết
    </Link>
  ) : null;

  const renewButton = showRenewAction ? (
    <Link
      href={editHref}
      title="Chỉnh sửa và gia hạn ngày kết thúc trước khi kích hoạt lại"
      className={cn(
        btnClass,
        'border border-rose-200 text-rose-700 hover:bg-rose-50',
      )}
    >
      Gia hạn
    </Link>
  ) : null;

  const publishButton = canPublish ? (
    <button
      type="button"
      disabled={isPending}
      onClick={handlePublish}
      className={cn(
        btnClass,
        'border border-brand-primary bg-brand-primary text-white hover:border-brand-primary hover:bg-brand-primary/90',
      )}
    >
      {isPending ? '…' : 'Kích hoạt'}
    </button>
  ) : null;

  const unpublishButton = canUnpublish ? (
    <button
      type="button"
      disabled={isPending}
      onClick={handleUnpublish}
      className={cn(
        btnClass,
        'border border-amber-400 bg-amber-400 text-brand-dark hover:border-amber-500 hover:bg-amber-500',
      )}
    >
      {isPending ? '…' : 'Tắt'}
    </button>
  ) : null;

  const deleteButton = canDelete ? (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className={cn(
        btnClass,
        'border border-red-200 text-red-600 hover:bg-red-50',
      )}
    >
      Xóa
    </button>
  ) : null;

  const rowGap = compact ? 'gap-1' : 'gap-1.5';
  const rowClass = cn('flex flex-nowrap items-center justify-end', rowGap);

  if (compact) {
    return (
      <div className="flex flex-nowrap items-center justify-end gap-1">
        {editButton}
        {renewButton}
        {publishButton}
        {unpublishButton}
        {deleteButton}
      </div>
    );
  }

  const wrapClass =
    layout === 'stack'
      ? 'flex flex-col gap-2 sm:flex-row sm:flex-wrap'
      : cn('flex flex-wrap items-center justify-end', rowGap);

  return (
    <div className={wrapClass}>
      {editButton}
      {detailButton}
      {renewButton}
      {publishButton}
      {unpublishButton}
      {deleteButton}
    </div>
  );
}
