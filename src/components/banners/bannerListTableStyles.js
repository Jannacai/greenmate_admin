/**
 * Cột bảng banner — densify đồng bộ voucher / order list.
 */

import { ADMIN_DENSE_TABLE_HEAD_BASE, LIST_TABLE_COL_PRESETS, LIST_TABLE_DIVIDER } from '@/lib/shared/listTableStyles';

export const BANNER_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[880px] table-fixed border-collapse text-sm';

export const BANNER_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const BANNER_TABLE_CELL_BASE = 'align-middle py-1';

export const BANNER_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const BANNER_TABLE_COL = {
  slide: LIST_TABLE_COL_PRESETS.name,
  sort: LIST_TABLE_COL_PRESETS.sort,
  link: LIST_TABLE_COL_PRESETS.link,
  pill: LIST_TABLE_COL_PRESETS.pill,
  actions: LIST_TABLE_COL_PRESETS.actions,
};
