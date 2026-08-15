'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requirePermission } from '@/lib/auth/assertPermission';
import { updateOrderStatus } from '@/lib/api/order';
import { mutationErrorMessage } from '@/lib/shared/actionError';

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/**
 * Cập nhật trạng thái đơn hàng.
 *
 * @param {string} orderId
 * @param {string} status
 */
export async function updateOrderStatusAction(orderId, status) {
  const denied = await requirePermission('update:any', 'order');
  if (denied) return denied;

  if (!orderId || !VALID_STATUSES.includes(status)) {
    return { error: 'Trạng thái không hợp lệ' };
  }

  try {
    await updateOrderStatus(orderId, { order_status: status });
    updateTag('orders');
    updateTag(`order-${orderId}`);
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể cập nhật trạng thái đơn') };
  }
}
