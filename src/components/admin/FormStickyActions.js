import { AdminButton, AdminButtonGhost, AdminButtonOutline } from '@/components/admin/AdminButton';
import { cn } from '@/lib/shared/utils';

/**
 * Thanh action cố định cuối form (mobile bottom / desktop inline).
 */
export function FormStickyActions({
  isPending,
  locked = false,
  onCancel,
  cancelLabel = 'Hủy',
  buttonClassName,
  children,
  className,
}) {
  const disabled = locked || isPending;

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-16 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur',
        'lg:static lg:mt-6 lg:border-t lg:border-gray-100 lg:bg-transparent lg:px-0 lg:py-5 lg:backdrop-blur-none',
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-2 sm:gap-3">
        <AdminButtonGhost type="button" onClick={onCancel} disabled={disabled} className={buttonClassName}>
          {cancelLabel}
        </AdminButtonGhost>
        {children}
      </div>
    </div>
  );
}

/** Nút submit form — text loading thống nhất. */
export function FormSubmitButton({
  pending = false,
  done = false,
  pendingLabel = 'Đang lưu…',
  doneLabel = 'Đã lưu — đang chuyển trang…',
  children,
  disabled,
  ...props
}) {
  const label = done ? doneLabel : pending ? pendingLabel : children;

  return (
    <AdminButton type="button" disabled={disabled || pending || done} {...props}>
      {label}
    </AdminButton>
  );
}

/** Nút outline submit (Lưu nháp / Lưu & đăng bán). */
export function FormSubmitButtonOutline({
  pending = false,
  done = false,
  pendingLabel = 'Đang lưu…',
  doneLabel = 'Đã lưu — đang chuyển trang…',
  children,
  disabled,
  ...props
}) {
  const label = done ? doneLabel : pending ? pendingLabel : children;

  return (
    <AdminButtonOutline type="button" disabled={disabled || pending || done} {...props}>
      {label}
    </AdminButtonOutline>
  );
}
