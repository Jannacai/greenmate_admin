import { formatDate } from '@/lib/shared/utils';
import { cn } from '@/lib/shared/utils';
import {
  AccessLogSheetRow,
  AccessLogSheetTable,
} from '@/components/users/UserDetailSheetTable';

/**
 * Bảng lịch sử đăng nhập kiểu spreadsheet — dùng chung staff / customer detail.
 *
 * @param {{
 *   items?: object[],
 *   total?: number,
 *   emptyLabel?: string,
 *   defaultLoginType?: string,
 *   className?: string,
 *   embedded?: boolean,
 * }} props
 */
export default function AccessLogSection({
  items = [],
  total = 0,
  emptyLabel = 'Chưa có lịch sử đăng nhập',
  defaultLoginType = 'USER',
  className,
  embedded = false,
}) {
  const content = !items.length ? (
    <p className="px-4 py-8 text-center text-xs text-gray-400">{emptyLabel}</p>
  ) : (
    <AccessLogSheetTable>
      {items.map((log, index) => (
        <AccessLogSheetRow
          key={log._id}
          index={index}
          time={log.createdAt ? formatDate(log.createdAt, 'datetime') : '—'}
          ip={log.ipAddress || '—'}
          device={log.userAgent || '—'}
          loginType={log.loginType ?? defaultLoginType}
        />
      ))}
    </AccessLogSheetTable>
  );

  if (embedded) {
    return (
      <div className={className}>
        {content}
        {total > 0 ? (
          <div className="border-t border-gray-200 bg-brand-gray/20 px-4 py-2 text-right text-xs tabular-nums text-gray-500">
            Hiển thị {items.length}/{total} bản ghi
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-brand-gray/40 px-4 py-2.5">
        <h3 className="text-sm font-bold text-brand-dark">Lịch sử đăng nhập</h3>
        {total > 0 ? (
          <span className="text-xs font-medium tabular-nums text-gray-500">
            {items.length}/{total} bản ghi
          </span>
        ) : null}
      </div>
      {content}
    </section>
  );
}
