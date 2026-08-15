'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerStatusAction } from '@/lib/actions/customer';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{
 *   userId: string,
 *   status?: string,
 *   canUpdate?: boolean,
 *   compact?: boolean,
 *   hideDetailLink?: boolean,
 * }} props
 */
export default function CustomerRowActions({
  userId,
  status = 'active',
  canUpdate = false,
  compact = false,
  hideDetailLink = false,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatus(nextStatus) {
    startTransition(async () => {
      const res = await updateCustomerStatusAction(userId, nextStatus);
      if (!res?.error) router.refresh();
    });
  }

  const btnClass = cn(
    'rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap',
    compact ? 'px-1.5 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
  );

  return (
    <div className={cn('flex items-center justify-end gap-1.5', compact && 'gap-1')}>
      {!hideDetailLink && (
        <Link
          href={`/customers/${userId}`}
          className={cn(btnClass, 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-brand-dark')}
        >
          Chi tiết
        </Link>
      )}

      {canUpdate && status !== 'active' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatus('active')}
          className={cn(btnClass, 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50')}
        >
          Mở khóa
        </button>
      )}

      {canUpdate && status === 'active' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatus('block')}
          className={cn(btnClass, 'border border-red-200 text-red-600 hover:bg-red-50')}
        >
          Khóa
        </button>
      )}

      {canUpdate && status === 'pending' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatus('active')}
          className={cn(btnClass, 'border border-brand-primary text-brand-primary hover:bg-brand-primary/5')}
        >
          Duyệt
        </button>
      )}
    </div>
  );
}
