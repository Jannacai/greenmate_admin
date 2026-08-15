'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpStaffAction } from '@/lib/actions/staff';
import { staffSignupSchema } from '@/lib/staff/staffSchema';
import { showError, showSuccess, showWarning } from '@/lib/shared/toast';
import {
  AdminButton,
  AdminButtonGhost,
  AdminField,
  AdminInput,
  AdminSelect,
  FormCard,
} from '@/components/admin';

const formSchema = staffSignupSchema;

const ROLE_TYPE_LABEL = {
  STAFF: 'Nhân viên',
};

/**
 * @param {{
 *   roles: Array<{ _id: string, role_name: string, role_slug: string, role_type: string, role_description?: string }>,
 *   rolesError?: string | null,
 * }} props
 */
export default function StaffSignupForm({ roles, rolesError }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction] = useActionState(signUpStaffAction, null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roleSlug: roles[0]?.role_slug ?? '',
    },
  });

  function onSubmit(data) {
    const formData = new FormData();
    formData.set('name', data.name);
    formData.set('email', data.email);
    formData.set('phone', data.phone);
    formData.set('password', data.password);
    formData.set('confirmPassword', data.confirmPassword);
    formData.set('roleSlug', data.roleSlug);
    startTransition(() => formAction(formData));
  }

  useEffect(() => {
    if (rolesError) {
      showWarning('Không tải được vai trò', `${rolesError}. Cần quyền đọc module RBAC.`);
    }
  }, [rolesError]);

  useEffect(() => {
    if (state?.error) {
      showError('Tạo tài khoản thất bại', state.error);
    }
  }, [state?.error]);

  useEffect(() => {
    if (!state?.success) return;
    showSuccess(state.message ?? 'Đã tạo tài khoản nhân viên');
    reset({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roleSlug: roles[0]?.role_slug ?? '',
    });
    const timer = setTimeout(() => router.push('/staff'), 1500);
    return () => clearTimeout(timer);
  }, [state?.success, state?.message, reset, roles, router]);

  const fieldError = (field) =>
    errors[field]?.message ?? state?.fieldErrors?.[field]?.[0];

  const noRoles = roles.length === 0;

  return (
    <FormCard title="Thông tin tài khoản">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField
            label="Họ và tên"
            htmlFor="name"
            error={fieldError('name')}
            className="md:col-span-2"
            required
          >
            <AdminInput
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              disabled={isPending || noRoles}
              error={Boolean(fieldError('name'))}
              {...register('name')}
            />
          </AdminField>

          <AdminField
            label="Email đăng nhập"
            htmlFor="email"
            error={fieldError('email')}
            className="md:col-span-2"
            required
          >
            <AdminInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nhanvien@greenmate.vn"
              disabled={isPending || noRoles}
              error={Boolean(fieldError('email'))}
              {...register('email')}
            />
          </AdminField>

          <AdminField
            label="Số điện thoại"
            htmlFor="phone"
            error={fieldError('phone')}
            className="md:col-span-2"
            required
            hint="Dùng để đăng nhập dashboard hoặc liên hệ."
          >
            <AdminInput
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="0912345678"
              disabled={isPending || noRoles}
              error={Boolean(fieldError('phone'))}
              {...register('phone')}
            />
          </AdminField>

          <AdminField
            label="Vai trò"
            htmlFor="roleSlug"
            error={fieldError('roleSlug')}
            hint="Chọn vai trò STAFF hoặc ADMIN. Quyền chi tiết được cấu hình tại trang Phân quyền."
            className="md:col-span-2"
            required
          >
            <AdminSelect
              id="roleSlug"
              disabled={isPending || noRoles}
              error={Boolean(fieldError('roleSlug'))}
              {...register('roleSlug')}
            >
              {noRoles ? (
                <option value="">Không có vai trò khả dụng</option>
              ) : (
                roles.map((role) => (
                  <option key={role._id} value={role.role_slug}>
                    {role.role_name} ({ROLE_TYPE_LABEL[role.role_type] ?? role.role_type}) — {role.role_slug}
                  </option>
                ))
              )}
            </AdminSelect>
          </AdminField>

          <AdminField label="Mật khẩu" htmlFor="password" error={fieldError('password')} required>
            <div className="relative">
              <AdminInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Tối thiểu 6 ký tự"
                disabled={isPending || noRoles}
                error={Boolean(fieldError('password'))}
                className="pr-10"
                {...register('password')}
              />
              <TogglePasswordButton
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                disabled={isPending || noRoles}
              />
            </div>
          </AdminField>

          <AdminField
            label="Xác nhận mật khẩu"
            htmlFor="confirmPassword"
            error={fieldError('confirmPassword')}
            required
          >
            <div className="relative">
              <AdminInput
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                disabled={isPending || noRoles}
                error={Boolean(fieldError('confirmPassword'))}
                className="pr-10"
                {...register('confirmPassword')}
              />
              <TogglePasswordButton
                visible={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                disabled={isPending || noRoles}
              />
            </div>
          </AdminField>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Tài khoản mới có trạng thái <span className="font-medium text-gray-600">pending</span> cho
            đến khi được kích hoạt.
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminButtonGhost type="button" onClick={() => router.push('/staff')}>
              Hủy
            </AdminButtonGhost>
            <AdminButton type="submit" disabled={isPending || noRoles}>
              {isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </AdminButton>
          </div>
        </div>
      </form>
    </FormCard>
  );
}

function TogglePasswordButton({ visible, onToggle, disabled }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      onClick={onToggle}
      disabled={disabled}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-40"
    >
      {visible ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858 5.858a3 3 0 104.243-4.243m-4.243 4.243L21 21M3 3l18 18" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}
