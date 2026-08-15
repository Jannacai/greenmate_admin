/**
 * Cột bảng staff — densify đồng bộ voucher / order list.
 */

import { ADMIN_DENSE_TABLE_HEAD_BASE, LIST_TABLE_DIVIDER } from '@/lib/shared/listTableStyles';

export const STAFF_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[900px] table-fixed border-collapse text-sm';

export const STAFF_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const STAFF_TABLE_CELL_BASE = 'align-middle py-1';

export const STAFF_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const STAFF_TABLE_COL = {
  code: 'min-w-[9rem] pl-2.5 pr-2',
  staff: 'w-auto max-w-0 px-2 min-w-[10rem]',
  role: 'w-36 px-1.5',
  lastLogin: 'w-[8.5rem] px-1.5',
  status: 'w-[7rem] px-1.5',
  created: 'w-[8.5rem] px-1.5',
  actions: 'w-32 pl-1.5 pr-2.5',
};
