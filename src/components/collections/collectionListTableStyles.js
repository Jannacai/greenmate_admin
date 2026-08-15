/**
 * Cột bảng collection — densify đồng bộ voucher / order list.
 */

import { ADMIN_DENSE_TABLE_HEAD_BASE, LIST_TABLE_COL_PRESETS, LIST_TABLE_DIVIDER } from '@/lib/shared/listTableStyles';

export const COLLECTION_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[880px] table-fixed border-collapse text-sm';

export const COLLECTION_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const COLLECTION_TABLE_CELL_BASE = 'align-middle py-1';

export const COLLECTION_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const COLLECTION_TABLE_COL = {
  name: LIST_TABLE_COL_PRESETS.name,
  products: LIST_TABLE_COL_PRESETS.sort,
  pill: LIST_TABLE_COL_PRESETS.pill,
  url: LIST_TABLE_COL_PRESETS.url,
  actions: LIST_TABLE_COL_PRESETS.actions,
};
