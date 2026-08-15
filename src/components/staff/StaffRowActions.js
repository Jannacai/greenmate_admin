'use client';

import { cn } from '@/lib/shared/utils';
import { useStaffStatusUpdate } from '@/hooks/useStaffStatusUpdate';
import StaffStatusPasswordDialog from '@/components/staff/StaffStatusPasswordDialog';

/**
 * @param {{
 *   userId: string,
 *   status?: string,
 *   canUpdate?: boolean,
 *   compact?: boolean,
 * }} props
 */
export default function StaffRowActions({
  userId,
  status = 'active',
  canUpdate = false,
  compact = false,
}) {
  const {
    isPending,
    dialogOpen,
    dialogTitle,
    dialogError,
    requestStatusChange,
    confirmWithPassword,
    closeDialog,
  } = useStaffStatusUpdate({ userId, currentStatus: status });

  const btnClass = cn(
    'inline-flex items-center justify-center rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap',
    compact ? 'px-1.5 py-1 text-[11px]' : 'min-h-[34px] px-3 py-1.5 text-xs',
  );

  return (
    <>
      <div className={cn('flex items-center justify-end gap-1.5', compact && 'gap-1')}>
        {canUpdate && status === 'pending' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => requestStatusChange('active')}
            className={cn(btnClass, 'border-amber-500 bg-amber-500 text-brand-dark hover:border-amber-600 hover:bg-amber-600')}
          >
            Duyệt
          </button>
        )}

        {canUpdate && status !== 'active' && status !== 'pending' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => requestStatusChange('active')}
            className={cn(btnClass, 'border-brand-primary bg-brand-primary text-white hover:bg-brand-primary/90')}
          >
            Mở khóa
          </button>
        )}

        {canUpdate && status === 'active' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => requestStatusChange('block')}
            className={cn(btnClass, 'border-red-600 bg-red-600 text-white hover:bg-red-700')}
          >
            Khóa
          </button>
        )}
      </div>

      <StaffStatusPasswordDialog
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) closeDialog(); }}
        title={dialogTitle}
        confirmLabel={dialogTitle}
        isPending={isPending}
        error={dialogError}
        onConfirm={confirmWithPassword}
      />
    </>
  );
}
