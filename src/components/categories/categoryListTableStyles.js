/**
 * Cột bảng category — densify đồng bộ voucher / order list.
 */

import { ADMIN_DENSE_TABLE_HEAD_BASE, LIST_TABLE_DIVIDER } from '@/lib/shared/listTableStyles';

export const CATEGORY_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[720px] table-fixed border-collapse text-sm';

export const CATEGORY_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const CATEGORY_TABLE_CELL_BASE = 'align-middle py-1.5';

export const CATEGORY_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const CATEGORY_TABLE_COL = {
  name: 'w-auto max-w-0 pl-2.5 pr-2',
  group: 'w-36 px-1.5',
  status: 'w-[7.5rem] px-1.5',
  storefront: 'w-[11rem] px-1.5',
  actions: 'w-40 pl-1.5 pr-2.5',
};
