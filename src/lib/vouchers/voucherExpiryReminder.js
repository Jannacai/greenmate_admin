import { stringifyMongoId } from '@/lib/shared/utils';

/** Số giờ trước hết hạn để hiện banner nhắc admin. */
export const VOUCHER_EXPIRY_REMINDER_HOURS = 48;

/**
 * Thời gian còn lại đến hết hạn — copy ngắn cho banner.
 * @param {string|Date} endDate
 * @param {Date} [now]
 */
export function formatVoucherTimeRemaining(endDate, now = new Date()) {
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return 'sắp hết hạn';

  const ms = end.getTime() - now.getTime();
  if (ms <= 0) return 'sắp hết hạn';

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days >= 1) {
    return hours > 0 ? `còn ${days} ngày ${hours} giờ` : `còn ${days} ngày`;
  }
  if (hours >= 1) {
    return minutes > 0 ? `còn ${hours} giờ ${minutes} phút` : `còn ${hours} giờ`;
  }
  if (minutes >= 1) return `còn ${minutes} phút`;
  return 'còn dưới 1 phút';
}

/**
 * @param {object} voucher
 */
export function getVoucherDetailHref(voucher) {
  const id = stringifyMongoId(voucher?._id);
  return id ? `/vouchers/${id}` : '/vouchers';
}
