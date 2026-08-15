'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import UserProfileForm, { UserProfileReadOnlySheet } from '@/components/users/UserProfileForm';
import AccessLogSection from '@/components/users/AccessLogSection';
import DetailContentTabs from '@/components/users/DetailContentTabs';
import UserDetailSummaryBar from '@/components/users/UserDetailSummaryBar';
import { USER_DETAIL_SHEET_VALUE_CLASS } from '@/components/users/UserDetailSheetTable';
import { updateCustomerStatusAction, updateCustomerAction } from '@/lib/actions/customer';
import { formatCurrency, formatDate, cn } from '@/lib/shared/utils';

const STATUS_BTN =
  'rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap';

const SEX_LABEL = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

/**
 * @param {{
 *   customer: object,
 *   accessLogs: { items: object[], total: number },
 *   canUpdate?: boolean,
 * }} props
 */
export default function CustomerDetailView({ customer, accessLogs, canUpdate = false }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  function cancelEdit() {
    setFormResetKey((key) => key + 1);
    setIsEditing(false);
  }

  function handleStatus(status) {
    startTransition(async () => {
      const res = await updateCustomerStatusAction(customer.user_id, status);
      if (!res?.error) router.refresh();
    });
  }

  const sexLabel = SEX_LABEL[customer.user_sex] ?? (customer.user_sex || '—');

  const accountColumn = {
    title: 'Tài khoản',
    rows: [
      {
        label: 'Mã KH',
        value: (
          <span className={cn(USER_DETAIL_SHEET_VALUE_CLASS, 'font-mono tabular-nums')}>
            {customer.user_id}
          </span>
        ),
      },
      {
        label: 'Trạng thái',
        value: <CustomerStatusBadge status={customer.user_status} />,
      },
      {
        label: 'Vai trò',
        value: customer.user_role?.role_name ?? 'Khách hàng',
      },
      {
        label: 'Ngày ĐK',
        value: customer.createdAt ? formatDate(customer.createdAt, 'datetime') : '—',
      },
    ],
  };

  const commerceColumn = {
    title: 'Thống kê',
    rows: [
      {
        label: 'Tổng chi tiêu',
        value: formatCurrency(customer.totalSpent ?? 0),
      },
      {
        label: 'Số đơn hàng',
        value: String(customer.orderCount ?? 0),
      },
    ],
  };

  const profileColumn = {
    title: 'Hồ sơ cá nhân',
    rows: [
      { label: 'Họ và tên', value: customer.user_name ?? '—' },
      { label: 'Email', value: customer.user_email ?? '—' },
      { label: 'Số điện thoại', value: customer.user_phone || '—' },
      { label: 'Giới tính', value: sexLabel },
      {
        label: 'Ngày sinh',
        value: customer.user_date_of_birth
          ? formatDate(customer.user_date_of_birth, 'date')
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
      {customer.user_status !== 'active' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatus('active')}
          className={cn(STATUS_BTN, 'bg-brand-primary text-white hover:bg-brand-primary/90')}
        >
          {customer.user_status === 'pending' ? 'Duyệt' : 'Mở khóa'}
        </button>
      )}
      {customer.user_status === 'active' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatus('block')}
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
          user={customer}
          action={updateCustomerAction}
          columns={[accountColumn, commerceColumn]}
          isEditing={isEditing}
          onSaved={() => setIsEditing(false)}
          onCancel={cancelEdit}
        />
      ) : (
        <UserProfileReadOnlySheet columns={[profileColumn, accountColumn, commerceColumn]} />
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
          defaultLoginType="USER"
          embedded
        />
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <UserDetailSummaryBar
        name={customer.user_name}
        userId={customer.user_id}
        status={customer.user_status}
        backHref="/customers"
        backLabel="Quay lại danh sách khách hàng"
        actions={statusActions}
      />

      <DetailContentTabs tabs={tabs} defaultTab="profile" />
    </div>
  );
}
