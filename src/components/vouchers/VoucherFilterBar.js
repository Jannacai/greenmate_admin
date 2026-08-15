'use client';

import Link from 'next/link';
import { cn } from '@/lib/shared/utils';
import { useListUrlFilters } from '@/hooks/useListUrlFilters';
import {
  AdminButton,
  AdminInput,
  AdminPlusIcon,
  AdminSelect,
  ListFilterPanel,
  ListFilterRow,
  ListFilterField,
  LIST_FILTER_BTN_CLASS,
  LIST_FILTER_GHOST_CLASS,
  LIST_FILTER_INPUT_CLASS,
  LIST_FILTER_SELECT_CLASS,
} from '@/components/admin';
import { APPLIES_TO_CONFIG } from '@/lib/vouchers/voucherAppliesToConfig';

const STATUS_TABS = [
  { key: '', countKey: 'all', label: 'Tất cả', hint: 'Mọi voucher — đang chạy đến đã tắt' },
  { key: 'active', countKey: 'active', label: 'Đang chạy', hint: 'Khách có thể dùng' },
  { key: 'scheduled', countKey: 'scheduled', label: 'Sắp diễn ra', hint: 'Chưa đến ngày bắt đầu' },
  { key: 'expired', countKey: 'expired', label: 'Hết hạn', hint: 'Quá ngày kết thúc' },
  { key: 'inactive', countKey: 'inactive', label: 'Đã tắt', hint: 'Admin tắt thủ công' },
];

const SORT_OPTIONS = [
  { value: 'lifecycle_asc', label: 'Đang chạy → Đã tắt' },
  { value: 'ctime', label: 'Mới nhất' },
  { value: 'ctime_asc', label: 'Cũ nhất' },
  { value: 'end_asc', label: 'Sắp hết hạn' },
  { value: 'end_desc', label: 'Hạn xa nhất' },
  { value: 'name_asc', label: 'Tên A → Z' },
  { value: 'uses_desc', label: 'Dùng nhiều nhất' },
];

const APPLIES_TO_OPTIONS = [
  { value: '', label: 'Mọi phạm vi' },
  ...Object.entries(APPLIES_TO_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  })),
];

/**
 * @param {{
 *   statusStats?: { all?: number, active?: number, scheduled?: number, expired?: number, inactive?: number },
 *   filteredTotal?: number,
 *   hasActiveFilters?: boolean,
 *   canCreate?: boolean,
 * }} props
 */
export default function VoucherFilterBar({
  statusStats,
  filteredTotal,
  hasActiveFilters = false,
  canCreate = false,
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

  const statusTab = searchParams.get('status') ?? '';
  const defaultSort = statusTab ? 'ctime' : 'lifecycle_asc';
  const sortValue = searchParams.get('sort') ?? defaultSort;

  const hasFilters =
    searchParams.get('search') ||
    searchParams.get('status') ||
    searchParams.get('applies_to') ||
    (searchParams.get('sort') && searchParams.get('sort') !== defaultSort);

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
        statusTabsAction={
          canCreate ? (
            <Link href="/vouchers/new" className="inline-flex shrink-0">
              <AdminButton className={cn(LIST_FILTER_BTN_CLASS, 'gap-1.5')}>
                {AdminPlusIcon}
                Thêm voucher
              </AdminButton>
            </Link>
          ) : null
        }
      >
        <ListFilterRow className="items-end">
          <ListFilterField
            label="Tìm kiếm"
            htmlFor="voucher-search"
            className="w-full max-w-[16rem] shrink-0 sm:w-[16rem]"
          >
            <AdminInput
              id="voucher-search"
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Tìm mã, tên voucher…"
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

          <ListFilterField label="Phạm vi" htmlFor="voucher-applies-to">
            <AdminSelect
              id="voucher-applies-to"
              value={searchParams.get('applies_to') ?? ''}
              onChange={(e) => replaceParams({ applies_to: e.target.value })}
              className={cn(LIST_FILTER_SELECT_CLASS, 'text-gray-600')}
            >
              {APPLIES_TO_OPTIONS.map((o) => (
                <option key={o.value || 'all-scopes'} value={o.value}>{o.label}</option>
              ))}
            </AdminSelect>
          </ListFilterField>

          <ListFilterField label="Sắp xếp" htmlFor="voucher-sort">
            <AdminSelect
              id="voucher-sort"
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
