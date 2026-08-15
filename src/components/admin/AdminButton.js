import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';

/** Class touch-friendly chuẩn admin (≥44px). */
export const ADMIN_TOUCH_CLASS = 'min-h-[44px] px-4 text-base font-semibold';

/** Nút compact cho bảng / RBAC dense UI. */
export const ADMIN_COMPACT_CLASS = 'min-h-9 h-auto px-2.5 text-sm font-semibold';

/**
 * Nút CTA chính — shadcn Button + touch target admin.
 * @param {import('react').ComponentProps<typeof Button>} props
 */
export function AdminButton({ className, size = 'lg', variant = 'default', ...props }) {
  return (
    <Button
      size={size}
      variant={variant}
      className={cn(ADMIN_TOUCH_CLASS, variant === 'default' && 'hover:bg-primary/90', className)}
      {...props}
    />
  );
}

/**
 * Nút phụ — viền brand, nền trắng.
 * @param {import('react').ComponentProps<typeof Button>} props
 */
export function AdminButtonOutline({ className, ...props }) {
  return (
    <AdminButton
      variant="outline"
      className={cn(
        'border-brand-primary font-medium text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Nút hủy / trung tính.
 * @param {import('react').ComponentProps<typeof Button>} props
 */
export function AdminButtonGhost({ className, ...props }) {
  return (
    <AdminButton
      variant="outline"
      className={cn('border-gray-300 font-medium text-gray-600 hover:bg-brand-gray', className)}
      {...props}
    />
  );
}
