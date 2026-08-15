import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import { PageBackButton } from '@/components/admin/PageBackButton';
import { cn } from '@/lib/shared/utils';

/**
 * Thanh tóm tắt chi tiết (KH / NV / đơn hàng) — back, tiêu đề, badge, hành động.
 *
 * @param {{
 *   name: string,
 *   userId?: string,
 *   status?: string,
 *   badge?: React.ReactNode,
 *   nameClassName?: string,
 *   backHref?: string,
 *   backLabel?: string,
 *   actions?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function UserDetailSummaryBar({
  name,
  userId,
  status,
  badge,
  nameClassName,
  backHref = '/dashboard',
  backLabel = 'Quay lại trang trước',
  actions,
  className,
}) {
  const resolvedBadge = badge ?? (status ? <CustomerStatusBadge status={status} /> : null);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:px-4',
        className,
      )}
    >
      <PageBackButton fallbackHref={backHref} label={backLabel} />

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={cn('truncate text-base font-bold text-brand-dark', nameClassName)}>
              {name}
              {userId ? (
                <span className="ml-1 font-mono text-sm font-semibold text-gray-500">
                  [{userId}]
                </span>
              ) : null}
            </h2>
            {resolvedBadge}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
