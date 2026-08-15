/**
 * Token bảng list admin — dùng chung voucher / banner / collection / product.
 * CSS grid: class `gm-admin-list-table` trong globals.css.
 */

/** Vạch cột giữa các ô (cột đầu không có). */
export const LIST_TABLE_DIVIDER = 'border-l border-gray-300';

export const LIST_TABLE_HEAD_BASE =
  'text-center text-[13.5px] font-bold uppercase tracking-wide text-brand-dark whitespace-nowrap';

/** Header bảng list densify — py-1.5 + nowrap (dùng chung mọi *ListTableStyles). */
export const ADMIN_DENSE_TABLE_HEAD_BASE =
  'py-1.5 text-center text-[13.5px] font-bold uppercase tracking-wide text-brand-dark whitespace-nowrap';

export const LIST_TABLE_CELL_BASE = 'align-middle py-2';

export const LIST_TABLE_PILL =
  'inline-flex h-[26px] w-max max-w-full shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2 text-[10px] font-semibold leading-none ring-1 md:text-xs';

/** CSS hook — vạch cột/dòng trong globals.css */
export const LIST_TABLE_CSS_HOOK = 'gm-admin-list-table';

export const LIST_TABLE_MIN_WIDTH_DEFAULT = 944;
export const LIST_TABLE_MIN_WIDTH_PRODUCT = 880;

/** Bảng list đa số module (voucher, banner, collection…) */
export const ADMIN_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[944px] table-fixed border-collapse text-sm';

/** Bảng sản phẩm — hẹp hơn một chút */
export const PRODUCT_ADMIN_LIST_TABLE_CLASS =
  'gm-admin-list-table w-full min-w-[880px] table-fixed border-collapse text-sm';

/** Width + padding cột hay dùng lại — module chỉ khai báo cột đặc thù. */
export const LIST_TABLE_COL_PRESETS = {
  name: 'w-auto max-w-0 pl-2 pr-2.5',
  primary: 'w-auto max-w-0 px-2.5',
  pill: 'w-[6.75rem] px-1',
  sort: 'w-[4.5rem] px-1',
  actions: 'w-[9.25rem] pl-2 pr-3',
  link: 'w-[11rem] px-2',
  url: 'w-[10.5rem] px-2',
  usage: 'w-[5.5rem] px-1',
};

/** Hover dòng bảng list — dùng cùng zebra. */
export const ADMIN_LIST_ROW_HOVER_CLASS = 'transition-colors hover:bg-gray-200';

/**
 * Nền xen kẽ chẵn/lẻ — dễ đọc hàng ngang.
 * @param {number} [rowIndex=0]
 * @returns {string}
 */
export function getAdminListRowZebraClass(rowIndex = 0) {
  return rowIndex % 2 === 1 ? 'bg-gray-100' : 'bg-white';
}
