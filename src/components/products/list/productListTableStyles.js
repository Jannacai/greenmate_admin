/**
 * Cột bảng sản phẩm — densify đồng bộ voucher / order list.
 */

import {
  ADMIN_DENSE_TABLE_HEAD_BASE,
  LIST_TABLE_DIVIDER,
  PRODUCT_ADMIN_LIST_TABLE_CLASS,
} from '@/lib/shared/listTableStyles';

export const PRODUCT_LIST_TABLE_CLASS = PRODUCT_ADMIN_LIST_TABLE_CLASS;

export const PRODUCT_TABLE_HEAD_BASE = ADMIN_DENSE_TABLE_HEAD_BASE;

export const PRODUCT_TABLE_CELL_BASE = 'align-middle py-1.5';

export const PRODUCT_TABLE_DIVIDER = LIST_TABLE_DIVIDER;

export const PRODUCT_TABLE_COL = {
  product: 'min-w-[12rem] pl-2.5 pr-2',
  productCode: 'w-[8.5rem] px-1.5',
  priceSale: 'w-[6.5rem] px-1.5',
  priceBase: 'w-[6.5rem] px-1.5',
  pill: 'w-[6.5rem] px-1',
  sold: 'w-14 px-1',
  actions: 'w-44 pl-1.5 pr-2.5',
};

export const PRODUCT_TABLE_PILL =
  'inline-flex h-6 w-[5.25rem] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-1.5 text-[10px] font-semibold leading-none ring-1';

export const PRODUCT_TABLE_TEXT_CELL =
  'inline-flex h-6 w-[5.25rem] shrink-0 items-center justify-center overflow-hidden text-[10px] font-semibold leading-none';
