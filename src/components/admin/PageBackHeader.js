import { PageBackButton } from '@/components/admin/PageBackButton';
import { cn } from '@/lib/shared/utils';

/**
 * Header trang form/detail — nút back + tiêu đề + mô tả + action tuỳ chọn.
 * Nút back dùng lịch sử trình duyệt; `backHref` chỉ là fallback khi mở trực tiếp URL.
 * @param {{
 *   backHref?: string,
 *   backLabel?: string,
 *   title: React.ReactNode,
 *   titleMeta?: React.ReactNode,
 *   titleClassName?: string,
 *   description?: React.ReactNode,
 *   badge?: React.ReactNode,
 *   action?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function PageBackHeader({
  backHref = '/dashboard',
  backLabel = 'Quay lại trang trước',
  title,
  titleMeta,
  titleClassName,
  description,
  badge,
  action,
  className,
}) {
  return (
    <div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex min-w-0 items-center gap-3">
        <PageBackButton fallbackHref={backHref} label={backLabel} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h1
              className={cn(
                'text-[22.5px] font-bold leading-none text-brand-dark',
                titleClassName,
              )}
            >
              {title}
            </h1>
            {titleMeta}
            {badge}
          </div>
          {description && (
            <div className="mt-0.5 text-sm text-gray-400 md:text-base">{description}</div>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
