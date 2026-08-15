'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { showError, showSuccess } from '@/lib/shared/toast';
import { toDateInputValue } from '@/lib/staff/userProfileSchema';
import { AdminButton, AdminButtonOutline, AdminInput, AdminSelect } from '@/components/admin';
import {
  USER_DETAIL_SHEET_CONTROL_CLASS,
  USER_DETAIL_SHEET_CONTROL_READONLY_CLASS,
  USER_DETAIL_SHEET_VALUE_CLASS,
  UserDetailSheetColumn,
  UserDetailSheetGrid,
  UserDetailSheetRow,
} from '@/components/users/UserDetailSheetTable';
import { cn, formatDate } from '@/lib/shared/utils';

const SEX_OPTIONS = [
  { value: '', label: '— Không chọn —' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const ROLE_TYPE_LABEL = {
  STAFF: 'Nhân viên',
  ADMIN: 'Quản trị',
};

/** @param {string} [value] */
function sexLabel(value) {
  return SEX_OPTIONS.find((o) => o.value === (value ?? ''))?.label ?? '— Không chọn —';
}

/**
 * @param {{
 *   user: object,
 *   action: (prevState: object|null, formData: FormData) => Promise<object>,
 *   roles?: Array<{ role_slug: string, role_name: string, role_type: string }>,
 *   showRole?: boolean,
 *   columns?: Array<{ title: string, rows: Array<{ label: string, value: React.ReactNode }> }>,
 *   isEditing?: boolean,
 *   onSaved?: () => void,
 *   onCancel?: () => void,
 *   className?: string,
 * }} props
 */
export default function UserProfileForm({
  user,
  action,
  roles = [],
  showRole = false,
  columns = [],
  isEditing = false,
  onSaved,
  onCancel,
  className,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDirty, setIsDirty] = useState(false);
  const [state, formAction] = useActionState(action, null);

  useEffect(() => {
    setIsDirty(false);
  }, [
    user.user_id,
    user.user_name,
    user.user_email,
    user.user_phone,
    user.user_sex,
    user.user_date_of_birth,
    user.user_role?.role_slug,
    isEditing,
  ]);

  useEffect(() => {
    if (state?.error) {
      showError('Không lưu được', state.error);
    }
  }, [state?.error]);

  useEffect(() => {
    if (!state?.success) return;
    showSuccess(state.message ?? 'Đã lưu thay đổi');
    setIsDirty(false);
    onSaved?.();
    router.refresh();
  }, [state?.success, state?.message, router, onSaved]);

  const fieldError = (field) => state?.fieldErrors?.[field]?.[0];
  const fieldErrors = state?.fieldErrors
    ? Object.values(state.fieldErrors).flat().filter(Boolean)
    : [];
  const gridColumns = Math.min(3, Math.max(2, columns.length + 1));
  const fieldsLocked = !isEditing || isPending;

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      onChange={() => {
        if (isEditing) setIsDirty(true);
      }}
      className={cn('space-y-0', className)}
    >
      <input type="hidden" name="userId" value={user.user_id} />

      <UserDetailSheetGrid columns={/** @type {2|3} */ (gridColumns)}>
        <UserDetailSheetColumn title="Hồ sơ cá nhân">
          <UserDetailSheetRow label="Họ và tên" required>
            <AdminInput
              id="name"
              name="name"
              type="text"
              defaultValue={user.user_name ?? ''}
              readOnly={fieldsLocked}
              error={Boolean(fieldError('name'))}
              className={fieldsLocked ? USER_DETAIL_SHEET_CONTROL_READONLY_CLASS : USER_DETAIL_SHEET_CONTROL_CLASS}
            />
          </UserDetailSheetRow>

          <UserDetailSheetRow label="Email" required>
            <AdminInput
              id="email"
              name="email"
              type="email"
              defaultValue={user.user_email ?? ''}
              readOnly={fieldsLocked}
              error={Boolean(fieldError('email'))}
              className={fieldsLocked ? USER_DETAIL_SHEET_CONTROL_READONLY_CLASS : USER_DETAIL_SHEET_CONTROL_CLASS}
            />
          </UserDetailSheetRow>

          <UserDetailSheetRow label="Số điện thoại">
            <AdminInput
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user.user_phone ?? ''}
              readOnly={fieldsLocked}
              error={Boolean(fieldError('phone'))}
              className={fieldsLocked ? USER_DETAIL_SHEET_CONTROL_READONLY_CLASS : USER_DETAIL_SHEET_CONTROL_CLASS}
            />
          </UserDetailSheetRow>

          <UserDetailSheetRow label="Giới tính">
            {fieldsLocked ? (
              <span className={USER_DETAIL_SHEET_VALUE_CLASS}>{sexLabel(user.user_sex)}</span>
            ) : (
              <AdminSelect
                id="sex"
                name="sex"
                defaultValue={user.user_sex ?? ''}
                error={Boolean(fieldError('sex'))}
                className={cn(USER_DETAIL_SHEET_CONTROL_CLASS, 'cursor-pointer')}
              >
                {SEX_OPTIONS.map((o) => (
                  <option key={o.value || 'none'} value={o.value}>{o.label}</option>
                ))}
              </AdminSelect>
            )}
          </UserDetailSheetRow>

          <UserDetailSheetRow label="Ngày sinh">
            {fieldsLocked ? (
              <span className={USER_DETAIL_SHEET_VALUE_CLASS}>
                {user.user_date_of_birth ? formatDate(user.user_date_of_birth) : '—'}
              </span>
            ) : (
              <AdminInput
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={toDateInputValue(user.user_date_of_birth)}
                error={Boolean(fieldError('dateOfBirth'))}
                className={USER_DETAIL_SHEET_CONTROL_CLASS}
              />
            )}
          </UserDetailSheetRow>
        </UserDetailSheetColumn>

        {columns.map((col) => (
          <UserDetailSheetColumn key={col.title} title={col.title}>
            {col.rows.map((row) => (
              <UserDetailSheetRow key={row.label} label={row.label}>
                {row.value}
              </UserDetailSheetRow>
            ))}
            {showRole && col.title === 'Phân quyền' ? (
              <UserDetailSheetRow label="Gán role" required>
                {fieldsLocked ? (
                  <span className={USER_DETAIL_SHEET_VALUE_CLASS}>
                    {user.user_role?.role_name
                      ? `${user.user_role.role_name} (${ROLE_TYPE_LABEL[user.user_role.role_type] ?? user.user_role.role_type})`
                      : '—'}
                  </span>
                ) : (
                  <AdminSelect
                    id="roleSlug"
                    name="roleSlug"
                    defaultValue={user.user_role?.role_slug ?? ''}
                    disabled={!roles.length}
                    error={Boolean(fieldError('roleSlug'))}
                    className={cn(USER_DETAIL_SHEET_CONTROL_CLASS, 'cursor-pointer')}
                  >
                    {roles.map((role) => (
                      <option key={role.role_slug} value={role.role_slug}>
                        {role.role_name} ({ROLE_TYPE_LABEL[role.role_type] ?? role.role_type})
                      </option>
                    ))}
                  </AdminSelect>
                )}
              </UserDetailSheetRow>
            ) : null}
          </UserDetailSheetColumn>
        ))}
      </UserDetailSheetGrid>

      {isEditing ? (
        <div className="space-y-2 border-t border-gray-200 bg-brand-gray/20 px-4 py-2.5">
          {fieldErrors.length > 0 ? (
            <p className="text-[11px] text-red-600">{fieldErrors[0]}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <AdminButtonOutline
              type="button"
              disabled={isPending}
              onClick={() => onCancel?.()}
              className="min-h-[36px] px-4 text-xs"
            >
              Hủy
            </AdminButtonOutline>
            <AdminButton
              type="submit"
              disabled={isPending || !isDirty}
              title={!isDirty ? 'Chưa có thay đổi để lưu' : undefined}
              className="min-h-[36px] px-4 text-xs"
            >
              {isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
            </AdminButton>
          </div>
        </div>
      ) : null}
    </form>
  );
}

/**
 * Bảng thông tin chỉ đọc — chia cột theo nhóm.
 *
 * @param {{
 *   columns: Array<{ title: string, rows: Array<{ label: string, value: React.ReactNode }> }>,
 * }} props
 */
export function UserProfileReadOnlySheet({ columns }) {
  const gridColumns = Math.min(4, Math.max(1, columns.length || 1));

  return (
    <UserDetailSheetGrid columns={/** @type {1|2|3|4} */ (gridColumns)}>
      {columns.map((col) => (
        <UserDetailSheetColumn key={col.title} title={col.title}>
          {col.rows.map((row) => (
            <UserDetailSheetRow key={row.label} label={row.label}>
              {row.value}
            </UserDetailSheetRow>
          ))}
        </UserDetailSheetColumn>
      ))}
    </UserDetailSheetGrid>
  );
}
