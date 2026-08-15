'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/shared/utils';

/**
 * Tab lọc trạng thái — dùng chung mọi trang list admin (Voucher, Sản phẩm, Nhân viên…).
 *
 * @param {{
 *   tabs: Array<{ key: string, countKey: string, label: string, hint?: string }>,
 *   counts?: Record<string, number>,
 *   paramName?: string,
 *   defaultKey?: string,
 *   sectionLabel?: string,
 *   countOverride?: { countKey: string, value: number },
 *   className?: string,
 * }} props
 */
export function StatusFilterTabs({
  tabs,
  counts,
  paramName = 'status',
  defaultKey = '',
  sectionLabel = 'Lọc theo trạng thái',
  countOverride,
  className,
  embedded = false,
  compact = false,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? defaultKey;
  const showCounts = Boolean(counts || countOverride);

  return (
    <div
      className={cn(
        embedded
          ? 'rounded-none border-0 bg-transparent p-0'
          : 'rounded-xl border border-gray-200 bg-white p-2 md:p-2.5',
        className,
      )}
    >
      {sectionLabel && !embedded && (
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 md:text-xs">
          {sectionLabel}
        </p>
      )}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-2">
        {tabs.map((tab) => {
          const params = new URLSearchParams(searchParams.toString());
          if (tab.key) params.set(paramName, tab.key);
          else params.delete(paramName);
          params.delete('page');

          const href = params.toString() ? `${pathname}?${params}` : pathname;
          const active = current === tab.key;
          const count = countOverride?.countKey === tab.countKey
            ? countOverride.value
            : counts?.[tab.countKey];

          return (
            <Link
              key={tab.key || 'all'}
              href={href}
              title={tab.hint}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg border font-semibold transition-colors',
                compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-xs md:text-sm',
                active
                  ? 'border-brand-primary-light bg-brand-primary-light text-white shadow-sm'
                  : 'border-gray-200 bg-brand-gray text-gray-600 hover:border-brand-primary hover:text-brand-primary',
              )}
            >
              <span>{tab.label}</span>
              {showCounts && count !== undefined && (
                <span
                  className={cn(
                    'min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[15px] font-extrabold tabular-nums leading-none',
                    Number(count) > 0
                      ? 'bg-white text-orange-500'
                      : active
                        ? 'bg-white text-gray-500'
                        : 'bg-white text-gray-400',
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
