'use client';

import { useState } from 'react';
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import UserProfileForm, { UserProfileReadOnlySheet } from '@/components/users/UserProfileForm';
import AccessLogSection from '@/components/users/AccessLogSection';
import DetailContentTabs from '@/components/users/DetailContentTabs';
import UserDetailSummaryBar from '@/components/users/UserDetailSummaryBar';
import { USER_DETAIL_SHEET_VALUE_CLASS } from '@/components/users/UserDetailSheetTable';
import StaffStatusPasswordDialog from '@/components/staff/StaffStatusPasswordDialog';
import { updateStaffAction } from '@/lib/actions/staff';
import { useStaffStatusUpdate } from '@/hooks/useStaffStatusUpdate';
import { getRoleTypeLabel } from '@/lib/rbac/rbacConstants';
import { formatDate, cn } from '@/lib/shared/utils';

const STATUS_BTN =
  'rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap';

/**
 * @param {{
 *   staff: object,
 *   accessLogs: { items: object[], total: number },
 *   canUpdate?: boolean,
 *   staffRoles?: Array<object>,
 * }} props
 */
export default function StaffDetailView({ staff, accessLogs, canUpdate = false, staffRoles = [] }) {
  const {
    isPending,
    dialogOpen,
    dialogTitle,
    dialogError,
    requestStatusChange,
    confirmWithPassword,
    closeDialog,
  } = useStaffStatusUpdate({ userId: staff.user_id, currentStatus: staff.user_status });

  const [isEditing, setIsEditing] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  function cancelEdit() {
    setFormResetKey((key) => key + 1);
    setIsEditing(false);
  }

  const accountColumn = {
    title: 'Tài khoản',
    rows: [
      {
        label: 'Mã NV',
        value: (
          <span className={cn(USER_DETAIL_SHEET_VALUE_CLASS, 'font-mono tabular-nums')}>
            {staff.user_id}
          </span>
        ),
      },
      {
        label: 'Trạng thái',
        value: <CustomerStatusBadge status={staff.user_status} />,
      },
      {
        label: 'Ngày tạo',
        value: staff.createdAt ? formatDate(staff.createdAt, 'datetime') : '—',
      },
    ],
  };

  const roleColumn = {
    title: 'Phân quyền',
    rows: [
      {
        label: 'Hệ thống',
        value: getRoleTypeLabel(staff.user_role?.role_type ?? 'STAFF'),
      },
      {
        label: 'Tên role',
        value: staff.user_role?.role_name ?? '—',
      },
      {
        label: 'Role slug',
        value: (
          <span className={cn(USER_DETAIL_SHEET_VALUE_CLASS, 'font-mono')}>
            {staff.user_role?.role_slug ?? '—'}
          </span>
        ),
      },
    ],
  };

  const profileColumn = {
    title: 'Hồ sơ cá nhân',
    rows: [
      { label: 'Họ và tên', value: staff.user_name ?? '—' },
      { label: 'Email', value: staff.user_email ?? '—' },
      { label: 'Số điện thoại', value: staff.user_phone || '—' },
      {
        label: 'Giới tính',
        value: staff.user_sex === 'male'
          ? 'Nam'
          : staff.user_sex === 'female'
            ? 'Nữ'
            : staff.user_sex === 'other'
              ? 'Khác'
              : '—',
      },
      {
        label: 'Ngày sinh',
        value: staff.user_date_of_birth
          ? formatDate(staff.user_date_of_birth, 'date')
          : '—',
      },
    ],
  };

  const statusActions = canUpdate ? (
    <>
      {!isEditing ? (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={cn(
            STATUS_BTN,
            'border border-brand-primary text-brand-primary hover:bg-brand-primary/5',
          )}
        >
          Sửa
        </button>
      ) : (
        <button
          type="button"
          onClick={cancelEdit}
          className={cn(
            STATUS_BTN,
            'border border-gray-300 text-gray-600 hover:bg-gray-50',
          )}
        >
          Hủy
        </button>
      )}
      {staff.user_status === 'pending' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => requestStatusChange('active')}
          className={cn(STATUS_BTN, 'bg-brand-primary text-white hover:bg-brand-primary/90')}
        >
          Duyệt
        </button>
      )}
      {staff.user_status !== 'active' && staff.user_status !== 'pending' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => requestStatusChange('active')}
          className={cn(STATUS_BTN, 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50')}
        >
          Mở khóa
        </button>
      )}
      {staff.user_status === 'active' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => requestStatusChange('block')}
          className={cn(STATUS_BTN, 'border border-red-200 text-red-600 hover:bg-red-50')}
        >
          Khóa
        </button>
      )}
    </>
  ) : null;

  const tabs = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      content: canUpdate ? (
        <UserProfileForm
          key={formResetKey}
          user={staff}
          action={updateStaffAction}
          roles={staffRoles}
          showRole
          columns={[accountColumn, roleColumn]}
          isEditing={isEditing}
          onSaved={() => setIsEditing(false)}
          onCancel={cancelEdit}
        />
      ) : (
        <UserProfileReadOnlySheet columns={[profileColumn, accountColumn, roleColumn]} />
      ),
    },
    {
      key: 'access-log',
      label: 'Lịch sử đăng nhập',
      badge: accessLogs.total > 0 ? (
        <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-gray-600">
          {accessLogs.total}
        </span>
      ) : null,
      content: (
        <AccessLogSection
          items={accessLogs.items}
          total={accessLogs.total}
          defaultLoginType="STAFF"
          embedded
        />
      ),
    },
  ];

  return (
    <>
      <div className="space-y-3">
        <UserDetailSummaryBar
          name={staff.user_name}
          userId={staff.user_id}
          status={staff.user_status}
          backHref="/staff"
          backLabel="Quay lại danh sách nhân viên"
          actions={statusActions}
        />

        <DetailContentTabs tabs={tabs} defaultTab="profile" />
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
