'use client';

import { cn } from '@/lib/shared/utils';
import { useListUrlFilters } from '@/hooks/useListUrlFilters';
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  ListFilterPanel,
  ListFilterRow,
  ListFilterField,
  LIST_FILTER_BTN_CLASS,
  LIST_FILTER_GHOST_CLASS,
  LIST_FILTER_INPUT_CLASS,
  LIST_FILTER_SELECT_CLASS,
} from '@/components/admin';

const DEFAULT_STATUS = 'pending';

const STATUS_TABS = [
  { key: 'pending', countKey: 'pending', label: 'Chờ xác nhận', hint: 'Đơn mới từ checkout' },
  { key: 'confirmed', countKey: 'confirmed', label: 'Đã xác nhận', hint: 'Đã duyệt, chờ giao' },
  { key: 'shipped', countKey: 'shipped', label: 'Đang giao', hint: 'Đang vận chuyển' },
  { key: 'delivered', countKey: 'delivered', label: 'Hoàn thành', hint: 'Đã giao thành công' },
  { key: 'cancelled', countKey: 'cancelled', label: 'Đã hủy', hint: 'Đơn đã hủy' },
];

const SORT_OPTIONS = [
  { value: 'ctime', label: 'Mới nhất' },
  { value: 'ctime_asc', label: 'Cũ nhất' },
];

/**
 * @param {{
 *   statusStats?: Record<string, number>,
 *   filteredTotal?: number,
 *   hasActiveFilters?: boolean,
 * }} props
 */
export default function OrderFilterBar({
  statusStats,
  filteredTotal,
  hasActiveFilters = false,
}) {
  const {
    searchParams,
    isPending,
    searchDraft,
    setSearchDraft,
    applySearch,
    replaceParams,
    pathname,
    router,
    startTransition,
  } = useListUrlFilters();

  const sortValue = searchParams.get('sort') ?? 'ctime';
  const statusValue = searchParams.get('status') || DEFAULT_STATUS;

  const hasFilters =
    searchParams.get('search') ||
    (searchParams.get('status') && searchParams.get('status') !== DEFAULT_STATUS) ||
    (searchParams.get('sort') && searchParams.get('sort') !== 'ctime');

  const clearFilters = () => {
    setSearchDraft('');
    startTransition(() => {
      router.replace(`${pathname}?status=${DEFAULT_STATUS}`);
    });
  };

  return (
    <div className={cn(isPending && 'pointer-events-none opacity-70')}>
      <ListFilterPanel
        statusTabs={{
          tabs: STATUS_TABS,
          counts: statusStats,
          defaultKey: DEFAULT_STATUS,
          countOverride:
            hasActiveFilters && filteredTotal !== undefined
              ? { countKey: statusValue, value: filteredTotal }
              : undefined,
        }}
      >
        <ListFilterRow className="items-end">
          <ListFilterField
            label="Tìm kiếm"
            htmlFor="order-search"
            className="w-full max-w-[16rem] shrink-0 sm:w-[16rem]"
          >
            <AdminInput
              id="order-search"
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Mã đơn, email, SĐT…"
              autoComplete="off"
              spellCheck={false}
              className={cn('min-w-0 w-full', LIST_FILTER_INPUT_CLASS)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applySearch();
                }
              }}
            />
          </ListFilterField>

          <div className="shrink-0">
            <AdminButton type="button" onClick={applySearch} className={LIST_FILTER_BTN_CLASS}>
              Tìm
            </AdminButton>
          </div>

          <ListFilterField label="Sắp xếp" htmlFor="order-sort">
            <AdminSelect
              id="order-sort"
              value={sortValue}
              onChange={(e) => replaceParams({ sort: e.target.value })}
              className={cn(LIST_FILTER_SELECT_CLASS, 'text-gray-600')}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </AdminSelect>
          </ListFilterField>

          {hasFilters && (
            <div className="shrink-0">
              <button type="button" onClick={clearFilters} className={LIST_FILTER_GHOST_CLASS}>
                Xóa lọc
              </button>
            </div>
          )}
        </ListFilterRow>
      </ListFilterPanel>
    </div>
  );
}
