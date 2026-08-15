'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDefaultProductListSort } from '@/lib/products/productListFilter';
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

const STATUS_TABS = [
  { key: '', countKey: 'all', label: 'Tất cả', hint: 'Đang bán đến nháp' },
  { key: 'published', countKey: 'published', label: 'Đang bán', hint: 'Khách thấy trên web' },
  { key: 'draft', countKey: 'draft', label: 'Nháp', hint: 'Chưa đăng bán' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'dryseed', label: 'Hạt khô' },
  { value: 'milkseed', label: 'Sữa hạt' },
  { value: 'combo', label: 'Combo' },
];

const VOUCHER_APPLIED_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'yes', label: 'Có voucher' },
  { value: 'no', label: 'Không có voucher' },
];

const SORT_OPTIONS = [
  { value: 'lifecycle_asc', label: 'Đang bán → Nháp' },
  { value: 'updated_desc', label: 'Cập nhật mới nhất' },
  { value: 'updated_asc', label: 'Cập nhật cũ nhất' },
  { value: 'name_asc', label: 'Tên A → Z' },
  { value: 'name_desc', label: 'Tên Z → A' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
];

/**
 * @param {{
 *   id: string,
 *   value: string,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   onClear: () => void,
 *   placeholder: string,
 *   showClear?: boolean,
 *   wrapperClassName?: string,
 *   onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
 * }} props
 */
function FilterInputWithClear({
  id,
  value,
  onChange,
  onClear,
  placeholder,
  showClear = false,
  wrapperClassName,
  onKeyDown,
}) {
  return (
    <div className={cn('relative min-w-0', wrapperClassName)}>
      <AdminInput
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn('w-full pr-8', LIST_FILTER_INPUT_CLASS)}
        onKeyDown={onKeyDown}
      />
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 py-0.5 text-xs font-semibold text-red-500 hover:text-red-600"
          aria-label="Xóa tìm kiếm"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * @param {{
 *   catalogStats?: { total?: number, published?: number, draft?: number },
 *   filteredTotal?: number,
 *   hasActiveFilters?: boolean,
 *   canCreate?: boolean,
 * }} props
 */
export default function ProductFilterBar({
  catalogStats,
  filteredTotal,
  hasActiveFilters = false,
  canCreate = false,
}) {
  const {
    searchParams,
    isPending,
    searchDraft,
    setSearchDraft,
    replaceParams,
    clearAllFilters,
  } = useListUrlFilters();

  const [voucherDraft, setVoucherDraft] = useState(searchParams.get('voucher') ?? '');

  useEffect(() => {
    setVoucherDraft(searchParams.get('voucher') ?? '');
  }, [searchParams]);

  function applySearch() {
    replaceParams({
      search: searchDraft.trim(),
      voucher: voucherDraft.trim(),
    });
  }

  function clearSearchField() {
    setSearchDraft('');
    replaceParams({ search: '' });
  }

  function clearVoucherField() {
    setVoucherDraft('');
    replaceParams({ voucher: '' });
  }

  function clearFilters() {
    setVoucherDraft('');
    clearAllFilters();
  }

  const statusTab = searchParams.get('status') ?? '';
  const defaultSort = getDefaultProductListSort(statusTab);
  const sortValue = searchParams.get('sort') ?? defaultSort;

  const hasFilters =
    searchParams.get('search') ||
    searchParams.get('voucher') ||
    searchParams.get('voucher_applied') ||
    searchParams.get('status') ||
    searchParams.get('type') ||
    (searchParams.get('sort') && searchParams.get('sort') !== defaultSort);

  const statusCounts = catalogStats
    ? {
      all: catalogStats.total ?? 0,
      published: catalogStats.published ?? 0,
      draft: catalogStats.draft ?? 0,
    }
    : undefined;

  const showSearchClear = Boolean(searchDraft.trim() || searchParams.get('search'));
  const showVoucherClear = Boolean(voucherDraft.trim() || searchParams.get('voucher'));

  return (
    <div className={cn(isPending && 'pointer-events-none opacity-70')}>
      <ListFilterPanel
        statusTabs={{
          tabs: STATUS_TABS,
          counts: statusCounts,
          countOverride:
            hasActiveFilters && filteredTotal !== undefined
              ? { countKey: 'all', value: filteredTotal }
              : undefined,
        }}
        statusTabsAction={
          canCreate ? (
            <Link href="/products/new" className="inline-flex shrink-0">
              <AdminButton className={cn(LIST_FILTER_BTN_CLASS, 'gap-1.5')}>
                {AdminPlusIcon}
                Thêm sản phẩm
              </AdminButton>
            </Link>
          ) : null
        }
      >
        <ListFilterRow className="items-end">
          <ListFilterField
            label="Tìm kiếm"
            htmlFor="product-search"
            className="w-full max-w-[16rem] shrink-0 sm:w-[16rem]"
          >
            <FilterInputWithClear
              id="product-search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onClear={clearSearchField}
              placeholder="Tên, mã SP…"
              showClear={showSearchClear}
              wrapperClassName="min-w-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applySearch();
                }
              }}
            />
          </ListFilterField>

          <ListFilterField
            label="Mã voucher"
            htmlFor="product-voucher-search"
            className="w-full min-w-[9.5rem] shrink-0 sm:w-[11rem]"
          >
            <FilterInputWithClear
              id="product-voucher-search"
              value={voucherDraft}
              onChange={(e) => setVoucherDraft(e.target.value)}
              onClear={clearVoucherField}
              placeholder="VD: SUMMER20"
              showClear={showVoucherClear}
              wrapperClassName="min-w-0"
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

          <ListFilterField label="Voucher áp dụng" htmlFor="product-voucher-applied">
            <AdminSelect
              id="product-voucher-applied"
              value={searchParams.get('voucher_applied') ?? ''}
              onChange={(e) => replaceParams({ voucher_applied: e.target.value })}
              className={cn(LIST_FILTER_SELECT_CLASS, 'text-gray-600')}
            >
              {VOUCHER_APPLIED_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
              ))}
            </AdminSelect>
          </ListFilterField>

          <ListFilterField label="Danh mục" htmlFor="product-type">
            <AdminSelect
              id="product-type"
              value={searchParams.get('type') ?? ''}
              onChange={(e) => replaceParams({ type: e.target.value })}
              className={cn(LIST_FILTER_SELECT_CLASS, 'text-gray-600')}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
              ))}
            </AdminSelect>
          </ListFilterField>

          <ListFilterField label="Sắp xếp" htmlFor="product-sort">
            <AdminSelect
              id="product-sort"
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
