'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminButton, AdminButtonOutline } from '@/components/admin';
import { CreateRoleForm } from '@/components/rbac/RbacForms';

/**
 * Modal tạo vai trò mới.
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   disabled?: boolean,
 *   onSubmit: (data: object) => void,
 * }} props
 */
export function CreateRoleDialog({ open, onOpenChange, disabled = false, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!disabled) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-md" showCloseButton={!disabled}>
        <DialogHeader>
          <DialogTitle className="text-brand-dark">Tạo chức vụ mới</DialogTitle>
          <DialogDescription>
            Thêm chức vụ rồi gán quyền theo module.
          </DialogDescription>
        </DialogHeader>

        <CreateRoleForm
          formId="create-role-form"
          hideSubmit
          open={open}
          disabled={disabled}
          onSubmit={onSubmit}
        />

        <DialogFooter className="border-t-0 bg-transparent p-0 sm:justify-end">
          <AdminButtonOutline
            type="button"
            disabled={disabled}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </AdminButtonOutline>
          <AdminButton type="submit" form="create-role-form" disabled={disabled}>
            {disabled ? 'Đang xử lý…' : 'Tạo chức vụ'}
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
