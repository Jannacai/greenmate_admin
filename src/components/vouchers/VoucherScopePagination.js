'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/shared/utils';

/**
 * Phân trang danh sách sản phẩm áp dụng voucher (query: scopePage, scopeLimit, scopeSearch).
 *
 * @param {{
 *   page: number,
 *   limit: number,
 *   total: number,
 *   compact?: boolean,
 * }} props
 */
export default function VoucherScopePagination({ page = 1, limit = 10, total = 0, compact = false }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit + 1;
  const end = Math.min(safePage * limit, total);

  function buildHref(nextPage) {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set('scopePage', String(nextPage));
    qs.set('scopeLimit', String(limit));
    return `${pathname}?${qs.toString()}`;
  }

  const pageNumbers = buildPageNumbers(safePage, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-t border-gray-100 pt-2',
        compact ? 'text-[10px]' : 'text-xs',
        !compact && 'sm:flex-row sm:items-center sm:justify-between',
      )}
    >
      <p className="text-gray-500">
        <span className="font-semibold text-brand-dark">{start}–{end}</span>
        {' / '}
        <span className="font-semibold text-brand-dark">{total}</span>
        {' sản phẩm'}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Phân trang sản phẩm áp dụng" className="flex items-center gap-1">
          {safePage > 1 ? (
            <PageLink href={buildHref(safePage - 1)} label="Trang trước" compact={compact}>
              ←
            </PageLink>
          ) : (
            <PageDisabled compact={compact}>←</PageDisabled>
          )}

          {pageNumbers.map((num, idx) =>
            num === '…' ? (
              <span key={`ellipsis-${idx}`} className="px-0.5 text-gray-400">…</span>
            ) : (
              <PageLink
                key={num}
                href={buildHref(num)}
                active={num === safePage}
                label={`Trang ${num}`}
                compact={compact}
              >
                {num}
              </PageLink>
            ),
          )}

          {safePage < totalPages ? (
            <PageLink href={buildHref(safePage + 1)} label="Trang sau" compact={compact}>
              →
            </PageLink>
          ) : (
            <PageDisabled compact={compact}>→</PageDisabled>
          )}
        </nav>
      )}
    </div>
  );
}

/** @param {{ href: string, children: React.ReactNode, active?: boolean, label: string, compact?: boolean }} props */
function PageLink({ href, children, active = false, label, compact }) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center justify-center rounded-md border font-medium transition-colors',
        compact ? 'min-h-[28px] min-w-[28px] px-1.5 text-[10px]' : 'min-h-[32px] min-w-[32px] px-2 text-xs',
        active
          ? 'border-brand-primary bg-brand-primary text-white'
          : 'border-gray-300 bg-white text-gray-600 hover:border-brand-primary hover:text-brand-primary',
      )}
    >
      {children}
    </Link>
  );
}

/** @param {{ children: React.ReactNode, compact?: boolean }} props */
function PageDisabled({ children, compact }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-300',
        compact ? 'min-h-[28px] min-w-[28px] px-1.5 text-[10px]' : 'min-h-[32px] min-w-[32px] px-2 text-xs',
      )}
    >
      {children}
    </span>
  );
}

/**
 * @param {number} current
 * @param {number} total
 * @returns {(number | string)[]}
 */
function buildPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  /** @type {(number | string)[]} */
  const result = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('…');
    }
    result.push(sorted[i]);
  }
  return result;
}
