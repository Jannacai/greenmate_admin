/**
 * Schema validate cập nhật hồ sơ user (khách hàng / nhân viên).
 */

import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().trim().email('Email không hợp lệ'),
  phone: z.string().trim().optional().or(z.literal('')),
  sex: z.enum(['', 'male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
});

export const staffProfileSchema = userProfileSchema.extend({
  roleSlug: z.string().trim().min(1, 'Vui lòng chọn vai trò'),
});

/**
 * @param {import('zod').SafeParseReturnType<any, any>} result
 * @returns {Record<string, string[]>}
 */
export function zodFieldErrors(result) {
  if (result.success) return {};
  /** @type {Record<string, string[]>} */
  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = [issue.message];
    }
  }
  return fieldErrors;
}

/** @param {Record<string, string>} data */
export function toProfileApiBody(data) {
  return {
    user_name: data.name,
    user_email: data.email,
    user_phone: data.phone ?? '',
    user_sex: data.sex ?? '',
    user_date_of_birth: data.dateOfBirth || null,
    ...(data.roleSlug ? { roleSlug: data.roleSlug } : {}),
  };
}

/** @param {string | Date | null | undefined} value */
export function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
