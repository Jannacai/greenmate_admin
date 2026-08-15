/**
 * Cột bảng đơn hàng — densify đồng bộ voucher / product list.
 */

import { ADMIN_DENSE_TABLE_HEAD_BASE, LIST_TABLE_DIVIDER } from '@/lib/shared/listTableStyles';

export const ORDER_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[1080px] table-fixed border-collapse text-sm';

export const ORDER_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const ORDER_TABLE_CELL_BASE = 'align-middle py-1.5';

export const ORDER_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const ORDER_TABLE_COL = {
  tracking: 'min-w-[9rem] pl-2.5 pr-2',
  customer: 'min-w-[8.5rem] px-2',
  customerId: 'min-w-[9rem] px-2',
  total: 'w-[7.5rem] px-1.5',
  payment: 'w-[6.5rem] px-1.5',
  status: 'w-[7.5rem] px-1.5',
  created: 'w-[8.5rem] px-1.5',
  actions: 'w-28 pl-1.5 pr-2.5',
};
