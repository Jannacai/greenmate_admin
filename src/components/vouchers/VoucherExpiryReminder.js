import Link from 'next/link';

import { cn } from '@/lib/shared/utils';
import {
  formatVoucherTimeRemaining,
  getVoucherDetailHref,
} from '@/lib/vouchers/voucherExpiryReminder';

/**
 * Banner nhắc voucher sắp hết hạn — đặt giữa title và nút tạo voucher.
 * @param {{ vouchers?: object[], className?: string }} props
 */
export default function VoucherExpiryReminder({ vouchers = [], className }) {
  if (!vouchers.length) return null;

  const suffix = vouchers.length === 1
    ? 'nữa sẽ hết hạn — cần gia hạn thêm hoặc xóa.'
    : 'sắp hết hạn — cần gia hạn thêm hoặc xóa.';

  return (
    <p
      className={cn(
        'text-xs font-medium leading-snug text-amber-800 md:text-sm',
        className,
      )}
    >
      <span className="text-amber-600" aria-hidden>
        ⚠
      </span>
      {' '}
      <span>Lưu ý: </span>
      {vouchers.map((voucher, index) => {
        const code = voucher.discount_code ?? '—';
        const remaining = formatVoucherTimeRemaining(voucher.discount_end_date);

        return (
          <span key={voucher._id ?? code}>
            {index > 0 ? <span> · </span> : null}
            <Link
              href={getVoucherDetailHref(voucher)}
              className="font-semibold text-amber-900 underline decoration-amber-400/70 underline-offset-2 hover:text-brand-primary"
            >
              Voucher {code}
            </Link>
            <span> {remaining}</span>
          </span>
        );
      })}
      <span> {suffix}</span>
    </p>
  );
}
