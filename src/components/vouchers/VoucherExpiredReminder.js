import Link from 'next/link';

import { cn } from '@/lib/shared/utils';
import { getVoucherDetailHref } from '@/lib/vouchers/voucherExpiryReminder';

/**
 * Banner đỏ — voucher đã hết hạn, cần xóa hoặc gia hạn.
 * @param {{ vouchers?: object[], total?: number, className?: string }} props
 */
export default function VoucherExpiredReminder({ vouchers = [], total = 0, className }) {
  const count = total > 0 ? total : vouchers.length;
  if (count <= 0) return null;

  const remaining = Math.max(0, count - vouchers.length);

  return (
    <p
      className={cn(
        'text-xs font-medium leading-snug text-rose-800 md:text-sm',
        className,
      )}
    >
      <span className="text-rose-600" aria-hidden>
        ●
      </span>
      {' '}
      <span>
        Đang có {count} voucher đã hết hạn
        {vouchers.length > 0 ? (
          <>
            {': '}
            {vouchers.map((voucher, index) => {
              const code = voucher.discount_code ?? '—';

              return (
                <span key={voucher._id ?? code}>
                  {index > 0 ? <span> · </span> : null}
                  <Link
                    href={getVoucherDetailHref(voucher)}
                    className="font-semibold text-rose-900 underline decoration-rose-400/70 underline-offset-2 hover:text-brand-primary"
                  >
                    {code}
                  </Link>
                </span>
              );
            })}
            {remaining > 0 ? (
              <span>
                {' '}
                và {remaining} mã khác
              </span>
            ) : null}
          </>
        ) : null}
        {' '}
        — cần xóa hoặc gia hạn.
        {' '}
        <Link
          href="/vouchers?status=expired"
          className="font-semibold text-rose-900 underline decoration-rose-400/70 underline-offset-2 hover:text-brand-primary"
        >
          Xem danh sách
        </Link>
      </span>
    </p>
  );
}
