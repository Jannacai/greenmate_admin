'use client';

import { useState } from 'react';
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
import { cn } from '@/lib/shared/utils';
import { useListUrlFilters } from '@/hooks/useListUrlFilters';

const STATUS_TABS = [
  { key: '', countKey: 'all', label: 'Tất cả', hint: 'Mọi khách hàng' },
  { key: 'active', countKey: 'active', label: 'Hoạt động', hint: 'Tài khoản đang hoạt động' },
  { key: 'pending', countKey: 'pending', label: 'Chờ duyệt', hint: 'Chưa kích hoạt' },
  { key: 'block', countKey: 'block', label: 'Đã khóa', hint: 'Bị khóa tài khoản' },
];

const SORT_OPTIONS = [
  { value: 'ctime', label: 'Mới nhất' },
  { value: 'ctime_asc', label: 'Cũ nhất' },
  { value: 'spending_desc', label: 'Chi tiêu cao' },
  { value: 'spending_asc', label: 'Chi tiêu thấp' },
];

/**
 * @param {{
 *   statusStats?: { all?: number, active?: number, pending?: number, block?: number },
 *   filteredTotal?: number,
 *   hasActiveFilters?: boolean,
 * }} props
 */
export default function CustomerFilterBar({
  statusStats,
  filteredTotal,
  hasActiveFilters = false,
}) {
  const {
    searchParams,
    isPending,
    searchDraft,
    setSearchDraft,
    replaceParams: updateParams,
    clearAllFilters,
  } = useListUrlFilters();

  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(
      searchParams.get('createdFrom')
      || searchParams.get('createdTo')
      || searchParams.get('spendingMin')
      || searchParams.get('spendingMax'),
    ),
  );

  function clearFilters() {
    setShowAdvanced(false);
    clearAllFilters();
  }

  const hasFilters = Boolean(
    searchParams.get('search')
    || searchParams.get('status')
    || searchParams.get('createdFrom')
    || searchParams.get('createdTo')
    || searchParams.get('spendingMin')
    || searchParams.get('spendingMax')
    || (searchParams.get('sort') && searchParams.get('sort') !== 'ctime'),
  );

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
            htmlFor="customer-search"
            className="w-full max-w-[16rem] shrink-0 sm:w-[16rem]"
          >
            <AdminInput
              id="customer-search"
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Tên, email, SĐT, mã khách…"
              className={cn('min-w-0 w-full', LIST_FILTER_INPUT_CLASS)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateParams({ search: searchDraft.trim() });
              }}
            />
          </ListFilterField>

          <div className="shrink-0">
            <AdminButton
              type="button"
              onClick={() => updateParams({ search: searchDraft.trim() })}
              className={LIST_FILTER_BTN_CLASS}
            >
              Tìm
            </AdminButton>
          </div>

          <ListFilterField label="Sắp xếp" htmlFor="customer-sort">
            <AdminSelect
              id="customer-sort"
              value={searchParams.get('sort') ?? 'ctime'}
              className={cn(LIST_FILTER_SELECT_CLASS, 'text-gray-600')}
              onChange={(e) => updateParams({ sort: e.target.value })}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </AdminSelect>
          </ListFilterField>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={LIST_FILTER_GHOST_CLASS}
          >
            {showAdvanced ? 'Ẩn lọc nâng cao' : 'Lọc nâng cao'}
          </button>

          {hasFilters && (
            <button type="button" onClick={clearFilters} className={LIST_FILTER_GHOST_CLASS}>
              Xóa lọc
            </button>
          )}
        </ListFilterRow>

        {showAdvanced && (
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2">
            <AdminInput
              id="customer-from"
              type="date"
              aria-label="Đăng ký từ"
              value={searchParams.get('createdFrom') ?? ''}
              onChange={(e) => updateParams({ createdFrom: e.target.value })}
              className={cn('w-auto min-w-[9.5rem]', LIST_FILTER_INPUT_CLASS, 'text-gray-600')}
            />
            <span className="text-xs text-gray-400">→</span>
            <AdminInput
              id="customer-to"
              type="date"
              aria-label="Đăng ký đến"
              value={searchParams.get('createdTo') ?? ''}
              onChange={(e) => updateParams({ createdTo: e.target.value })}
              className={cn('w-auto min-w-[9.5rem]', LIST_FILTER_INPUT_CLASS, 'text-gray-600')}
            />
            <AdminInput
              id="customer-spending-min"
              type="number"
              min="0"
              aria-label="Chi tiêu từ"
              placeholder="Chi tiêu từ (đ)"
              value={searchParams.get('spendingMin') ?? ''}
              onChange={(e) => updateParams({ spendingMin: e.target.value })}
              className={cn('w-auto min-w-[8.5rem]', LIST_FILTER_INPUT_CLASS, 'text-gray-600')}
            />
            <AdminInput
              id="customer-spending-max"
              type="number"
              min="0"
              aria-label="Chi tiêu đến"
              placeholder="Chi tiêu đến (đ)"
              value={searchParams.get('spendingMax') ?? ''}
              onChange={(e) => updateParams({ spendingMax: e.target.value })}
              className={cn('w-auto min-w-[8.5rem]', LIST_FILTER_INPUT_CLASS, 'text-gray-600')}
            />
          </div>
        )}
      </ListFilterPanel>
    </div>
  );
}
