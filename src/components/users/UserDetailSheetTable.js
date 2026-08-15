import {
  ADMIN_LIST_TABLE_CLASS,
  LIST_TABLE_CELL_BASE,
  LIST_TABLE_DIVIDER,
} from '@/lib/shared/listTableStyles';
import { cn } from '@/lib/shared/utils';

/**
 * Lưới 1–4 cột — mỗi cột gom tiêu đề tương đồng (kiểu spreadsheet).
 *
 * @param {{
 *   children: React.ReactNode,
 *   columns?: 1 | 2 | 3 | 4,
 *   className?: string,
 * }} props
 */
export function UserDetailSheetGrid({ children, columns = 3, className }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 divide-y divide-gray-200 lg:divide-y-0',
        columns === 1 && 'lg:grid-cols-1',
        columns === 2 && 'lg:grid-cols-2 lg:divide-x',
        columns === 3 && 'lg:grid-cols-3 lg:divide-x',
        columns === 4 && 'lg:grid-cols-2 lg:divide-x xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Một cột trong lưới — tiêu đề nhóm + bảng Trường | Giá trị.
 *
 * @param {{
 *   title: string,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function UserDetailSheetColumn({ title, children, className }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="border-b border-[#b5a99a] bg-[#ddd5cc] px-3 py-2 text-center">
        <h3 className="text-[13.5px] font-bold uppercase tracking-wide text-brand-dark">
          {title}
        </h3>
      </div>
      <table className={cn(ADMIN_LIST_TABLE_CLASS, 'min-w-0')}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Chiều cao dòng + typography giá trị — đồng nhất text thuần và input. */
export const USER_DETAIL_SHEET_ROW_H = 'h-10';
export const USER_DETAIL_SHEET_LABEL_CLASS =
  'text-[13px] font-semibold leading-snug text-gray-600';
export const USER_DETAIL_SHEET_VALUE_CLASS =
  'text-sm font-medium leading-snug text-brand-dark';
export const USER_DETAIL_SHEET_CONTROL_CLASS = cn(
  'h-7 min-h-7 max-h-7 py-0 !text-sm font-medium leading-snug text-brand-dark',
  'disabled:cursor-not-allowed disabled:bg-white disabled:text-brand-dark disabled:opacity-100',
);
/** Input chỉ xem — vẫn bôi đen/copy được (không dùng disabled). */
export const USER_DETAIL_SHEET_CONTROL_READONLY_CLASS = cn(
  USER_DETAIL_SHEET_CONTROL_CLASS,
  'cursor-text select-text read-only:cursor-text read-only:opacity-100',
);

/**
 * @param {{
 *   label: string,
 *   children: React.ReactNode,
 *   required?: boolean,
 * }} props
 */
export function UserDetailSheetRow({ label, children, required = false }) {
  return (
    <tr className={cn('bg-white', USER_DETAIL_SHEET_ROW_H)}>
      <td
        className={cn(
          LIST_TABLE_DIVIDER,
          USER_DETAIL_SHEET_ROW_H,
          'w-[8rem] bg-[#f3f4f6] px-2.5 py-0 align-middle sm:w-[9.5rem]',
          USER_DETAIL_SHEET_LABEL_CLASS,
        )}
      >
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </td>
      <td
        className={cn(
          USER_DETAIL_SHEET_ROW_H,
          USER_DETAIL_SHEET_VALUE_CLASS,
          'min-w-0 select-text px-2.5 py-0 align-middle',
          '[&_input]:!text-sm [&_input:disabled]:text-brand-dark [&_input:disabled]:opacity-100',
          '[&_input:read-only]:cursor-text [&_input:read-only]:select-text',
          '[&_select]:!text-sm [&_select:disabled]:text-brand-dark [&_select:disabled]:opacity-100',
        )}
      >
        {children}
      </td>
    </tr>
  );
}

/**
 * Bảng log đăng nhập — nhiều cột kiểu Excel.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function AccessLogSheetTable({ children, className }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className={cn(ADMIN_LIST_TABLE_CLASS, 'min-w-[640px]')}>
        <thead>
          <tr>
            <th className={cn('w-12 px-2', LIST_TABLE_DIVIDER)}>STT</th>
            <th className={cn('w-[9.5rem] px-2', LIST_TABLE_DIVIDER)}>Thời gian</th>
            <th className={cn('w-[10.5rem] px-2', LIST_TABLE_DIVIDER)}>IP</th>
            <th className={cn('min-w-0 px-2', LIST_TABLE_DIVIDER)}>Thiết bị</th>
            <th className="w-20 px-2">Loại</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/**
 * @param {{
 *   index: number,
 *   time: React.ReactNode,
 *   ip: React.ReactNode,
 *   device: React.ReactNode,
 *   loginType: React.ReactNode,
 * }} props
 */
export function AccessLogSheetRow({ index, time, ip, device, loginType }) {
  return (
    <tr className="bg-white">
      <td className={cn(LIST_TABLE_CELL_BASE, LIST_TABLE_DIVIDER, 'px-2 text-center text-xs tabular-nums text-gray-500')}>
        {index + 1}
      </td>
      <td className={cn(LIST_TABLE_CELL_BASE, LIST_TABLE_DIVIDER, 'px-2 text-xs font-semibold tabular-nums text-brand-dark')}>
        {time}
      </td>
      <td className={cn(LIST_TABLE_CELL_BASE, LIST_TABLE_DIVIDER, 'px-2 font-mono text-[11px] text-gray-600')}>
        {ip}
      </td>
      <td
        className={cn(LIST_TABLE_CELL_BASE, LIST_TABLE_DIVIDER, 'max-w-0 truncate px-2 text-[11px] text-gray-500')}
        title={typeof device === 'string' ? device : undefined}
      >
        {device}
      </td>
      <td className={cn(LIST_TABLE_CELL_BASE, 'px-2 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400')}>
        {loginType}
      </td>
    </tr>
  );
}
