'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  deleteCollectionAction,
  publishCollectionAction,
  unpublishCollectionAction,
} from '@/lib/actions/collection';
import { showError, showSuccess } from '@/lib/shared/toast';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{
 *   collectionId: string,
 *   collection: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   layout?: 'row' | 'stack',
 *   hideDetailLink?: boolean,
 *   compact?: boolean,
 * }} props
 */
export default function CollectionRowActions({
  collectionId,
  collection,
  canUpdate = false,
  canDelete = false,
  layout = 'row',
  hideDetailLink = false,
  compact = false,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = collection?.collection_is_active === true;
  const canPublish = canUpdate && !isActive;
  const canUnpublish = canUpdate && isActive;

  function handlePublish() {
    startTransition(async () => {
      const res = await publishCollectionAction(collectionId);
      if (res?.error) {
        showError('Kích hoạt thất bại', res.error);
        return;
      }
      showSuccess('Đã kích hoạt bộ sưu tập');
      router.refresh();
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const res = await unpublishCollectionAction(collectionId);
      if (res?.error) {
        showError('Tắt bộ sưu tập thất bại', res.error);
        return;
      }
      showSuccess('Đã tắt bộ sưu tập');
      router.refresh();
    });
  }

  function handleDelete() {
    const name = collection?.collection_name ?? 'bộ sưu tập';
    if (!window.confirm(`Xóa "${name}"? Hành động không thể hoàn tác.`)) return;

    startTransition(async () => {
      const res = await deleteCollectionAction(collectionId);
      if (res?.error) {
        showError('Xóa bộ sưu tập thất bại', res.error);
      }
    });
  }

  const editHref = `/collections/${collectionId}/edit`;
  const detailHref = `/collections/${collectionId}`;

  const btnClass = cn(
    'rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
    compact ? 'px-2 py-1 text-[14px]' : 'px-2.5 py-1.5 text-xs',
  );

  const editButton = canUpdate ? (
    <Link
      href={editHref}
      className={cn(btnClass, 'border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5')}
    >
      Sửa
    </Link>
  ) : null;

  const detailButton = !hideDetailLink ? (
    <Link
      href={detailHref}
      className={cn(btnClass, 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-brand-dark')}
    >
      Chi tiết
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
      className={cn(btnClass, 'border border-red-200 text-red-600 hover:bg-red-50')}
    >
      Xóa
    </button>
  ) : null;

  const rowGap = compact ? 'gap-1' : 'gap-1.5';
  const rowClass = cn('flex flex-nowrap items-center justify-end', rowGap);

  if (compact) {
    const hasStatusRow = Boolean(publishButton || unpublishButton);
    const hasEditRow = Boolean(editButton || deleteButton);

    return (
      <div className="pointer-events-auto flex flex-col items-end gap-1">
        {hasStatusRow && (
          <div className={rowClass}>
            {publishButton}
            {unpublishButton}
          </div>
        )}
        {hasEditRow && (
          <div className={rowClass}>
            {editButton}
            {deleteButton}
          </div>
        )}
      </div>
    );
  }

  const wrapClass =
    layout === 'stack'
      ? 'pointer-events-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap'
      : cn('pointer-events-auto flex flex-wrap items-center justify-end', rowGap);

  return (
    <div className={wrapClass}>
      {editButton}
      {detailButton}
      {publishButton}
      {unpublishButton}
      {deleteButton}
    </div>
  );
}
