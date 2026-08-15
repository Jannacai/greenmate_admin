'use client';

import { useState } from 'react';
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
  { key: '', countKey: 'all', label: 'Tất cả', hint: 'Mọi nhân viên' },
  { key: 'active', countKey: 'active', label: 'Hoạt động', hint: 'Đang đăng nhập được' },
  { key: 'pending', countKey: 'pending', label: 'Chờ duyệt', hint: 'Chưa kích hoạt' },
  { key: 'block', countKey: 'block', label: 'Đã khóa', hint: 'Bị khóa tài khoản' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'Mọi loại' },
  { value: 'STAFF', label: 'Nhân viên' },
  { value: 'ADMIN', label: 'Quản trị' },
];

const SORT_OPTIONS = [
  { value: 'ctime', label: 'Mới nhất' },
  { value: 'ctime_asc', label: 'Cũ nhất' },
];

/**
 * @param {{
 *   statusStats?: { all?: number, active?: number, pending?: number, block?: number },
 *   filteredTotal?: number,
 *   hasActiveFilters?: boolean,
 * }} props
 */
export default function StaffFilterBar({
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
    Boolean(searchParams.get('createdFrom') || searchParams.get('createdTo')),
  );

  function clearFilters() {
    setShowAdvanced(false);
    clearAllFilters();
  }

  const hasFilters =
    searchParams.get('search')
    || searchParams.get('status')
    || searchParams.get('roleFilter')
    || searchParams.get('createdFrom')
    || searchParams.get('createdTo')
    || (searchParams.get('sort') && searchParams.get('sort') !== 'ctime');

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
            htmlFor="staff-search"
            className="w-full max-w-[16rem] shrink-0 sm:w-[16rem]"
          >
            <AdminInput
              id="staff-search"
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Tên, email, mã nhân viên…"
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

          <ListFilterField label="Loại" htmlFor="staff-role">
            <AdminSelect
              id="staff-role"
              value={searchParams.get('roleFilter') ?? ''}
              onChange={(e) => updateParams({ roleFilter: e.target.value })}
              className={cn(LIST_FILTER_SELECT_CLASS, 'text-gray-600')}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
              ))}
            </AdminSelect>
          </ListFilterField>

          <ListFilterField label="Sắp xếp" htmlFor="staff-sort">
            <AdminSelect
              id="staff-sort"
              value={searchParams.get('sort') ?? 'ctime'}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className={cn(LIST_FILTER_SELECT_CLASS, 'text-gray-600')}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </AdminSelect>
          </ListFilterField>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={LIST_FILTER_GHOST_CLASS}
          >
            {showAdvanced ? 'Ẩn ngày' : 'Ngày tạo'}
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
              id="staff-from"
              type="date"
              aria-label="Tạo từ ngày"
              value={searchParams.get('createdFrom') ?? ''}
              onChange={(e) => updateParams({ createdFrom: e.target.value })}
              className={cn('w-auto min-w-[9.5rem]', LIST_FILTER_INPUT_CLASS, 'text-gray-600')}
            />
            <span className="text-xs text-gray-400">→</span>
            <AdminInput
              id="staff-to"
              type="date"
              aria-label="Tạo đến ngày"
              value={searchParams.get('createdTo') ?? ''}
              onChange={(e) => updateParams({ createdTo: e.target.value })}
              className={cn('w-auto min-w-[9.5rem]', LIST_FILTER_INPUT_CLASS, 'text-gray-600')}
            />
          </div>
        )}
      </ListFilterPanel>
    </div>
  );
}
