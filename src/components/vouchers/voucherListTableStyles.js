/**
 * Cột bảng voucher — densify giống product list.
 */

import { ADMIN_DENSE_TABLE_HEAD_BASE, LIST_TABLE_DIVIDER } from '@/lib/shared/listTableStyles';

export const VOUCHER_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[980px] table-fixed border-collapse text-sm';

export const VOUCHER_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const VOUCHER_TABLE_CELL_BASE = 'align-middle py-1.5';

export const VOUCHER_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const VOUCHER_TABLE_COL = {
  code: 'min-w-[10rem] pl-2.5 pr-2',
  value: 'w-[5.5rem] px-2',
  minOrder: 'w-[7.75rem] px-1.5',
  scope: 'w-[6.5rem] px-1.5',
  start: 'w-[8.25rem] px-1.5',
  end: 'w-[8.25rem] px-1.5',
  usage: 'w-[5.5rem] px-1.5',
  status: 'w-[7rem] px-1.5',
  actions: 'w-44 pl-1.5 pr-2.5',
};
