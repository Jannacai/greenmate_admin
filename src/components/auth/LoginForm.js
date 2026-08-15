'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminButton, AdminInput } from '@/components/admin';
import { loginAction } from '@/lib/actions/auth';
import { getLoginReasonMessage } from '@/lib/auth/accountAccess';
import { parseLoginIdentifier } from '@/lib/shared/phone';
import { showError, showWarning } from '@/lib/shared/toast';

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email hoặc số điện thoại không được để trống')
    .superRefine((value, ctx) => {
      const parsed = parseLoginIdentifier(value);
      if (parsed.error) {
        ctx.addIssue({ code: 'custom', message: parsed.error });
      }
    }),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

/**
 * @param {{ reason?: string }} props
 */
export default function LoginForm({ reason }) {
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction]          = useActionState(loginAction, null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  function onSubmit(data) {
    const formData = new FormData();
    formData.set('identifier', data.identifier);
    formData.set('password', data.password);
    startTransition(() => formAction(formData));
  }

  const fieldError = (field) =>
    errors[field]?.message ?? state?.fieldErrors?.[field]?.[0];

  const sessionMessage = getLoginReasonMessage(reason);

  useEffect(() => {
    if (sessionMessage) {
      showWarning('Phiên đăng nhập', sessionMessage);
    }
  }, [sessionMessage]);

  useEffect(() => {
    if (state?.error) {
      showError('Đăng nhập thất bại', state.error);
    }
  }, [state?.error]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <AdminInput
          id="identifier"
          type="text"
          autoComplete="username"
          autoFocus
          placeholder="Email/SĐT của bạn"
          aria-label="Email hoặc số điện thoại"
          disabled={isPending}
          error={Boolean(fieldError('identifier'))}
          {...register('identifier')}
        />
        {fieldError('identifier') && (
          <p className="text-sm text-red-500">{fieldError('identifier')}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <AdminInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Mật khẩu"
            aria-label="Mật khẩu"
            disabled={isPending}
            error={Boolean(fieldError('password'))}
            className="pr-11"
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
          </button>
        </div>
        {fieldError('password') && (
          <p className="text-sm text-red-500">{fieldError('password')}</p>
        )}
      </div>

      <AdminButton type="submit" disabled={isPending} className="w-full gap-2 mt-2">
        {isPending ? (
          <>
            <IconSpinner className="h-4 w-4 animate-spin" />
            <span>Đang đăng nhập…</span>
          </>
        ) : (
          'Đăng nhập'
        )}
      </AdminButton>
    </form>
  );
}

function IconEye({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconEyeOff({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function IconSpinner({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
