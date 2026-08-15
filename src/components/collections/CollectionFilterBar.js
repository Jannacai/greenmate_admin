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

const STATUS_TABS = [
  { key: '', countKey: 'all', label: 'Tất cả', hint: 'Mọi bộ sưu tập — đang hiển thị đến đã ẩn' },
  { key: 'active', countKey: 'active', label: 'Đang hiển thị', hint: 'Khách có thể xem trên storefront' },
  { key: 'inactive', countKey: 'inactive', label: 'Đã ẩn', hint: 'Nháp hoặc admin tắt thủ công' },
];

const SORT_OPTIONS = [
  { value: 'ctime', label: 'Mới nhất' },
  { value: 'ctime_asc', label: 'Cũ nhất' },
  { value: 'name_asc', label: 'Tên A → Z' },
  { value: 'sort_asc', label: 'Thứ tự hiển thị' },
];

/**
 * @param {{
 *   statusStats?: { all?: number, active?: number, inactive?: number },
 *   filteredTotal?: number,
 *   hasActiveFilters?: boolean,
 * }} props
 */
export default function CollectionFilterBar({
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
    clearAllFilters: clearFilters,
    replaceParams,
  } = useListUrlFilters();

  const sortValue = searchParams.get('sort') ?? 'ctime';

  const hasFilters =
    searchParams.get('search') ||
    searchParams.get('status') ||
    (searchParams.get('sort') && searchParams.get('sort') !== 'ctime');

  return (
    <div className={cn(isPending && 'pointer-events-none opacity-70')}>
      <ListFilterPanel
        statusTabs={{
          tabs: STATUS_TABS,
          counts: statusStats,
          countOverride:
            hasActiveFilters && filteredTotal !== undefined
              ? { countKey: 'all', value: filteredTotal }
              : undefined,
        }}
      >
        <ListFilterRow className="items-end">
          <ListFilterField
            label="Tìm kiếm"
            htmlFor="collection-search"
            className="w-full max-w-[16rem] shrink-0 sm:w-[16rem]"
          >
            <AdminInput
              id="collection-search"
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Tìm tên, slug, _id…"
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

          <ListFilterField label="Sắp xếp" htmlFor="collection-sort">
            <AdminSelect
              id="collection-sort"
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
