import { cn } from '@/lib/shared/utils';
import { StatusFilterTabs } from '@/components/admin/StatusFilterTabs';

/**
 * Card lọc thống nhất: tab trạng thái + toolbar một hàng gọn.
 *
 * @param {{
 *   statusTabs?: Record<string, unknown>,
 *   statusTabsAction?: React.ReactNode,
 *   children?: React.ReactNode,
 *   hint?: React.ReactNode,
 *   footer?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function ListFilterPanel({ statusTabs, statusTabsAction, children, hint, footer, className }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200 bg-white', className)}>
      {(statusTabs || statusTabsAction) && (
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5',
            children && 'border-b border-gray-100',
          )}
        >
          {statusTabs ? (
            <div className="min-w-0 flex-1">
              <StatusFilterTabs {...statusTabs} embedded compact />
            </div>
          ) : (
            <div className="min-w-0 flex-1" />
          )}
          {statusTabsAction ? (
            <div className="shrink-0">{statusTabsAction}</div>
          ) : null}
        </div>
      )}

      {children && (
        <div className="px-2 py-1.5">
          {children}
          {hint && (
            <p className="mt-1 text-[10px] leading-snug text-gray-400">
              {hint}
            </p>
          )}
        </div>
      )}

      {footer}
    </div>
  );
}

/**
 * Ô lọc có nhãn phụ phía trên.
 *
 * @param {{
 *   label: React.ReactNode,
 *   htmlFor?: string,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function ListFilterField({ label, htmlFor, children, className }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-bold text-brand-dark"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Một hàng toolbar — flex wrap, gap nhỏ.
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function ListFilterRow({ children, className }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5 md:gap-2', className)}>
      {children}
    </div>
  );
}

/**
 * Nhóm search chiếm phần còn lại.
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function ListFilterSearchGroup({ children, className }) {
  return (
    <div className={cn('flex min-w-0 flex-1 basis-[180px] items-center gap-1.5', className)}>
      {children}
    </div>
  );
}
