'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStaffStatusAction } from '@/lib/actions/staff';
import {
  getStaffStatusActionLabel,
  staffStatusRequiresPassword,
} from '@/lib/staff/staffStatus';
import { showError, showSuccess } from '@/lib/shared/toast';

/**
 * @param {{ userId: string, currentStatus?: string }} options
 */
export function useStaffStatusUpdate({ userId, currentStatus = 'active' }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [dialogError, setDialogError] = useState(null);

  function runStatusUpdate(nextStatus, actorPassword) {
    startTransition(async () => {
      const res = await updateStaffStatusAction(userId, nextStatus, actorPassword);
      if (res?.error) {
        if (dialogOpen) {
          setDialogError(res.error);
        } else {
          showError('Cập nhật trạng thái thất bại', res.error);
        }
        return;
      }

      setDialogOpen(false);
      setPendingStatus(null);
      setDialogError(null);
      showSuccess('Đã cập nhật trạng thái nhân viên');
      router.refresh();
    });
  }

  function requestStatusChange(nextStatus) {
    if (staffStatusRequiresPassword(currentStatus, nextStatus)) {
      setDialogError(null);
      setPendingStatus(nextStatus);
      setDialogOpen(true);
      return;
    }

    runStatusUpdate(nextStatus);
  }

  function confirmWithPassword(password) {
    if (!pendingStatus) return;
    setDialogError(null);
    runStatusUpdate(pendingStatus, password);
  }

  function closeDialog() {
    if (isPending) return;
    setDialogOpen(false);
    setPendingStatus(null);
    setDialogError(null);
  }

  const dialogTitle = pendingStatus
    ? getStaffStatusActionLabel(pendingStatus, currentStatus)
    : 'Xác nhận thao tác';

  return {
    isPending,
    dialogOpen,
    dialogTitle,
    dialogError,
    requestStatusChange,
    confirmWithPassword,
    closeDialog,
  };
}
