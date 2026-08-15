'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requirePermission } from '@/lib/auth/assertPermission';
import { updateCustomerStatus, updateCustomer } from '@/lib/api/customer';
import { userProfileSchema, zodFieldErrors, toProfileApiBody } from '@/lib/staff/userProfileSchema';
import { mutationErrorMessage } from '@/lib/shared/actionError';

const VALID_STATUSES = ['pending', 'active', 'block'];

/**
 * Khóa / mở / duyệt tài khoản khách hàng.
 * @param {string} userId
 * @param {'pending'|'active'|'block'} status
 */
export async function updateCustomerStatusAction(userId, status) {
  const denied = await requirePermission('update:any', 'customer');
  if (denied) return denied;

  if (!VALID_STATUSES.includes(status)) {
    return { error: 'Trạng thái không hợp lệ' };
  }

  try {
    await updateCustomerStatus(userId, status);
    updateTag('customers');
    revalidatePath('/customers');
    revalidatePath(`/customers/${userId}`);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể cập nhật trạng thái') };
  }
}

/**
 * Cập nhật hồ sơ khách hàng.
 * @param {object|null} prevState
 * @param {FormData} formData
 */
export async function updateCustomerAction(prevState, formData) {
  const userId = (formData.get('userId') ?? '').toString();
  if (!userId) return { error: 'Thiếu mã khách hàng' };

  const denied = await requirePermission('update:any', 'customer');
  if (denied) return denied;

  const raw = {
    name: (formData.get('name') ?? '').toString(),
    email: (formData.get('email') ?? '').toString(),
    phone: (formData.get('phone') ?? '').toString(),
    sex: (formData.get('sex') ?? '').toString(),
    dateOfBirth: (formData.get('dateOfBirth') ?? '').toString(),
  };

  const parsed = userProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed) };
  }

  try {
    await updateCustomer(userId, toProfileApiBody(parsed.data));
    updateTag('customers');
    updateTag(`customer-${userId}`);
    revalidatePath('/customers');
    revalidatePath(`/customers/${userId}`);
    return { success: true, message: 'Đã cập nhật thông tin khách hàng' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể cập nhật khách hàng') };
  }
}
