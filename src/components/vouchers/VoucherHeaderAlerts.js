import VoucherExpiryReminder from '@/components/vouchers/VoucherExpiryReminder';
import VoucherExpiredReminder from '@/components/vouchers/VoucherExpiredReminder';
import { cn } from '@/lib/shared/utils';

/**
 * Cụm banner giữa header trang Voucher — sắp hết hạn (vàng) + đã hết hạn (đỏ).
 * @param {{
 *   expiringSoon?: object[],
 *   expired?: object[],
 *   expiredTotal?: number,
 *   className?: string,
 * }} props
 */
export default function VoucherHeaderAlerts({
  expiringSoon = [],
  expired = [],
  expiredTotal = 0,
  className,
}) {
  const hasExpiring = expiringSoon.length > 0;
  const hasExpired = expiredTotal > 0 || expired.length > 0;

  if (!hasExpiring && !hasExpired) return null;

  return (
    <div className={cn('space-y-1', className)}>
      {hasExpiring ? <VoucherExpiryReminder vouchers={expiringSoon} /> : null}
      {hasExpired ? (
        <VoucherExpiredReminder vouchers={expired} total={expiredTotal} />
      ) : null}
    </div>
  );
}
