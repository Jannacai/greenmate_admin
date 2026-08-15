/**
 * Schema Zod validate form đăng ký nhân viên — dùng trong Server Action.
 */

import { z } from 'zod';
import { isValidVietnamesePhone } from '@/lib/shared/phone';

const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Số điện thoại không được để trống')
  .refine(isValidVietnamesePhone, 'Số điện thoại không hợp lệ');

export const staffSignupSchema = z
  .object({
    name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự'),
    email: z.string().trim().email('Email không hợp lệ'),
    phone: phoneSchema,
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự'),
    roleSlug: z.string().trim().min(1, 'Vui lòng chọn vai trò'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
