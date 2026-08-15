'use client';

import { useEffect, useState } from 'react';
import {
  AdminButton,
  AdminButtonOutline,
  AdminInput,
  ListFilterPanel,
  ListFilterRow,
  ListFilterField,
  LIST_FILTER_BTN_CLASS,
  LIST_FILTER_INPUT_CLASS,
} from '@/components/admin';
import { cn } from '@/lib/shared/utils';
import { useListUrlFilters } from '@/hooks/useListUrlFilters';

const STOCK_TABS = [
  { key: '', countKey: 'all', label: 'Tất cả', hint: 'Mọi nguyên liệu' },
  { key: 'ok', countKey: 'ok', label: 'Còn hàng', hint: 'Tồn kho đủ' },
  { key: 'low', countKey: 'low', label: 'Sắp hết', hint: 'Dưới ngưỡng cảnh báo' },
  { key: 'out', countKey: 'out', label: 'Hết hàng', hint: 'Tồn = 0' },
];

/**
 * @param {{
 *   stockStats?: { all?: number, ok?: number, low?: number, out?: number },
 *   filteredTotal?: number,
 *   hasActiveFilters?: boolean,
 * }} props
 */
export default function IngredientFilterBar({
  stockStats,
  filteredTotal,
  hasActiveFilters = false,
}) {
  const {
    searchParams,
    isPending,
    searchDraft,
    setSearchDraft,
    replaceParams,
    clearAllFilters,
  } = useListUrlFilters();

  const urlLocation = searchParams.get('location') ?? '';
  const [locationDraft, setLocationDraft] = useState(urlLocation);

  useEffect(() => {
    setLocationDraft(urlLocation);
  }, [urlLocation]);

  function applyFilters() {
    replaceParams({
      search: searchDraft.trim(),
      location: locationDraft.trim(),
    });
  }

  const hasFilters = Boolean(searchParams.get('search') || searchParams.get('location'));

  return (
    <div className={cn(isPending && 'pointer-events-none opacity-70')}>
      <ListFilterPanel
        statusTabs={{
          tabs: STOCK_TABS,
          counts: stockStats,
          paramName: 'stock',
          countOverride:
            hasActiveFilters && filteredTotal !== undefined
              ? { countKey: 'all', value: filteredTotal }
              : undefined,
        }}
      >
        <ListFilterRow className="items-end">
          <ListFilterField
            label="Tìm kiếm"
            htmlFor="ingredient-search"
            className="w-full max-w-[16rem] shrink-0 sm:w-[16rem]"
          >
            <AdminInput
              id="ingredient-search"
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Tên nguyên liệu…"
              className={cn('min-w-0 w-full', LIST_FILTER_INPUT_CLASS)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </ListFilterField>

          <ListFilterField
            label="Vị trí"
            htmlFor="ingredient-location"
            className="w-full max-w-[10rem] shrink-0 sm:w-[10rem]"
          >
            <AdminInput
              id="ingredient-location"
              type="text"
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              placeholder="Vị trí kho…"
              className={cn('min-w-0 w-full', LIST_FILTER_INPUT_CLASS)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </ListFilterField>

          <div className="shrink-0">
            <AdminButton type="button" onClick={applyFilters} disabled={isPending} className={LIST_FILTER_BTN_CLASS}>
              {isPending ? '…' : 'Lọc'}
            </AdminButton>
          </div>

          {hasFilters && (
            <div className="shrink-0">
              <AdminButtonOutline
                type="button"
                onClick={() => {
                  setLocationDraft('');
                  clearAllFilters();
                }}
                className={LIST_FILTER_BTN_CLASS}
              >
                Xóa
              </AdminButtonOutline>
            </div>
          )}
        </ListFilterRow>
      </ListFilterPanel>
    </div>
  );
}
