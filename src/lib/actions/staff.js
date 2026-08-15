'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { signUpStaff, updateStaffStatus, updateStaffMember } from '@/lib/api/staff';
import { staffSignupSchema } from '@/lib/staff/staffSchema';
import { staffProfileSchema, zodFieldErrors, toProfileApiBody } from '@/lib/staff/userProfileSchema';
import { requirePermission } from '@/lib/auth/assertPermission';
import { mutationErrorMessage } from '@/lib/shared/actionError';

/**
 * @param {Object|null} prevState
 * @param {FormData} formData
 */
export async function signUpStaffAction(prevState, formData) {
  const raw = {
    name: (formData.get('name') ?? '').toString().trim(),
    email: (formData.get('email') ?? '').toString().trim(),
    phone: (formData.get('phone') ?? '').toString().trim(),
    password: (formData.get('password') ?? '').toString(),
    confirmPassword: (formData.get('confirmPassword') ?? '').toString(),
    roleSlug: (formData.get('roleSlug') ?? '').toString().trim(),
  };

  const parsed = staffSignupSchema.safeParse(raw);
  if (!parsed.success) {
    /** @type {Record<string, string[]>} */
    const fieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = [issue.message];
      }
    }
    return { fieldErrors };
  }

  const denied = await requirePermission('update:any', 'staff');
  if (denied) return denied;

  const { name, email, phone, password, roleSlug } = parsed.data;

  try {
    await signUpStaff(roleSlug, { name, email, phone, password });
    revalidatePath('/staff');
    updateTag('staff');
    return {
      success: true,
      message: `Đã tạo tài khoản nhân viên ${email}. Trạng thái ban đầu: chờ duyệt (pending).`,
    };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể tạo tài khoản nhân viên') };
  }
}

/**
 * @param {string} userId
 * @param {'pending'|'active'|'block'} status
 * @param {string} [actorPassword] — bắt buộc khi khóa / mở khóa
 */
export async function updateStaffStatusAction(userId, status, actorPassword) {
  const denied = await requirePermission('update:any', 'staff');
  if (denied) return denied;

  try {
    await updateStaffStatus(userId, status, actorPassword);
    updateTag('staff');
    revalidatePath('/staff');
    revalidatePath(`/staff/${userId}`);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể cập nhật trạng thái nhân viên') };
  }
}

/**
 * @param {object|null} prevState
 * @param {FormData} formData
 */
export async function updateStaffAction(prevState, formData) {
  const userId = (formData.get('userId') ?? '').toString();
  if (!userId) return { error: 'Thiếu mã nhân viên' };

  const denied = await requirePermission('update:any', 'staff');
  if (denied) return denied;

  const raw = {
    name: (formData.get('name') ?? '').toString(),
    email: (formData.get('email') ?? '').toString(),
    phone: (formData.get('phone') ?? '').toString(),
    sex: (formData.get('sex') ?? '').toString(),
    dateOfBirth: (formData.get('dateOfBirth') ?? '').toString(),
    roleSlug: (formData.get('roleSlug') ?? '').toString(),
  };

  const parsed = staffProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed) };
  }

  try {
    await updateStaffMember(userId, toProfileApiBody(parsed.data));
    updateTag('staff');
    updateTag(`staff-${userId}`);
    revalidatePath('/staff');
    revalidatePath(`/staff/${userId}`);
    return { success: true, message: 'Đã cập nhật thông tin nhân viên' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể cập nhật nhân viên') };
  }
}
