import Link from 'next/link';
import { cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

/**
 * Phân trang danh sách — luôn hiển thị khi có dữ liệu (kể cả 1 trang).
 * Số dòng / trang cố định `DEFAULT_LIST_LIMIT` (10).
 *
 * @param {{
 *   page: number,
 *   limit?: number,
 *   total: number,
 *   querySuffix?: string,
 *   itemLabel?: string,
 * }} props
 */
export default function ListPagination({
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  total = 0,
  querySuffix = '',
  itemLabel = 'mục',
}) {
  if (total <= 0) return null;

  const pageSize = DEFAULT_LIST_LIMIT;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  function buildHref(nextPage) {
    const qs = new URLSearchParams(querySuffix);
    qs.set('page', String(nextPage));
    qs.delete('limit');
    const str = qs.toString();
    return str ? `?${str}` : `?page=${nextPage}`;
  }

  const pageNumbers = buildPageNumbers(safePage, totalPages);

  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        Hiển thị{' '}
        <span className="font-semibold text-brand-dark">{start}–{end}</span>
        {' '}trong{' '}
        <span className="font-semibold text-brand-dark">{total}</span>
        {' '}{itemLabel}
      </p>

      <nav aria-label="Phân trang" className="flex items-center gap-1">
        {safePage > 1 ? (
          <PaginationLink href={buildHref(safePage - 1)} label="Trang trước">
            ←
          </PaginationLink>
        ) : (
          <PaginationDisabled>←</PaginationDisabled>
        )}

        {pageNumbers.map((num, idx) =>
          num === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">…</span>
          ) : (
            <PaginationLink
              key={num}
              href={buildHref(num)}
              active={num === safePage}
              label={`Trang ${num}`}
            >
              {num}
            </PaginationLink>
          ),
        )}

        {safePage < totalPages ? (
          <PaginationLink href={buildHref(safePage + 1)} label="Trang sau">
            →
          </PaginationLink>
        ) : (
          <PaginationDisabled>→</PaginationDisabled>
        )}
      </nav>
    </div>
  );
}

/** @param {{ href: string, children: React.ReactNode, active?: boolean, label: string }} props */
function PaginationLink({ href, children, active = false, label }) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border px-2 text-xs font-medium transition-colors',
        active
          ? 'border-brand-primary bg-brand-primary text-white'
          : 'border-gray-300 bg-white text-gray-600 hover:border-brand-primary hover:text-brand-primary',
      )}
    >
      {children}
    </Link>
  );
}

/** @param {{ children: React.ReactNode }} props */
function PaginationDisabled({ children }) {
  return (
    <span className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-300">
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
  if (total <= 7) {
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
