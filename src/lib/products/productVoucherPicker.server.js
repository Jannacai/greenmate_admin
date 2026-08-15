import { getEligibleProductVouchersForPicker } from '@/lib/api/discount';
import { serializeEligibleVoucherForPicker } from '@/lib/products/productVoucherPicker';

/**
 * Voucher toàn shop đang active — picker form sản phẩm.
 * Dùng admin API `/discount/eligible-for-product` (không paginate toàn bộ voucher).
 * Chỉ gọi từ Server Components / Server Actions.
 */
export async function getEligibleProductVouchers() {
  const items = await getEligibleProductVouchersForPicker();
  return items.map(serializeEligibleVoucherForPicker);
}
