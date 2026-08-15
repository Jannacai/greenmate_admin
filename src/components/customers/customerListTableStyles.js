/**
 * Cột bảng customer — densify đồng bộ voucher / order list.
 */

import { ADMIN_DENSE_TABLE_HEAD_BASE, LIST_TABLE_DIVIDER } from '@/lib/shared/listTableStyles';

export const CUSTOMER_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[860px] table-fixed border-collapse text-sm';

export const CUSTOMER_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const CUSTOMER_TABLE_CELL_BASE = 'align-middle py-1';

export const CUSTOMER_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const CUSTOMER_TABLE_COL = {
  code: 'min-w-[9rem] pl-2.5 pr-2',
  customer: 'w-auto max-w-0 px-2',
  spent: 'w-[7.5rem] px-1.5',
  status: 'w-[7rem] px-1.5',
  lastLogin: 'w-[8.5rem] px-1.5',
  registered: 'w-[8.5rem] px-1.5',
  actions: 'w-36 pl-1.5 pr-2.5',
};
