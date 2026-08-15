'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminButton, AdminButtonOutline, AdminInput } from '@/components/admin';

/**
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   title: string,
 *   description?: string,
 *   confirmLabel?: string,
 *   isPending?: boolean,
 *   error?: string | null,
 *   onConfirm: (password: string) => void | Promise<void>,
 * }} props
 */
export default function StaffStatusPasswordDialog({
  open,
  onOpenChange,
  title,
  description = 'Nhập mật khẩu tài khoản đang đăng nhập để xác nhận thao tác này.',
  confirmLabel = 'Xác nhận',
  isPending = false,
  error = null,
  onConfirm,
}) {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!open) {
      setPassword('');
    }
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(password);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isPending}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-brand-dark">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label htmlFor="staff-status-actor-password" className="sr-only">
              Mật khẩu xác nhận
            </label>
            <AdminInput
              id="staff-status-actor-password"
              type="password"
              autoComplete="current-password"
              placeholder="Mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              error={Boolean(error)}
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter className="border-t-0 bg-transparent p-0 sm:justify-end">
            <AdminButtonOutline
              type="button"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </AdminButtonOutline>
            <AdminButton type="submit" disabled={isPending || !password.trim()}>
              {isPending ? 'Đang xử lý…' : confirmLabel}
            </AdminButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
