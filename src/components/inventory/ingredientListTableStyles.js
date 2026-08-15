/**
 * Cột bảng ingredient — densify đồng bộ voucher / order list.
 */

import { ADMIN_DENSE_TABLE_HEAD_BASE, LIST_TABLE_DIVIDER } from '@/lib/shared/listTableStyles';

export const INGREDIENT_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[880px] table-fixed border-collapse text-sm';

export const INGREDIENT_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const INGREDIENT_TABLE_CELL_BASE = 'align-middle py-1';

export const INGREDIENT_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const INGREDIENT_TABLE_COL = {
  name: 'w-auto max-w-0 pl-2.5 pr-2',
  stock: 'w-32 px-1.5',
  cost: 'w-28 px-1.5',
  location: 'w-36 px-1.5',
  updated: 'w-[8.5rem] px-1.5',
  actions: 'w-44 pl-1.5 pr-2.5',
};
