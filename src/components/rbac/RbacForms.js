'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AdminButton,
  AdminButtonGhost,
  AdminButtonOutline,
  AdminField,
  AdminInput,
  AdminSelect,
} from '@/components/admin';
import {
  RBAC_ACTION_GROUPS,
  ROLE_TYPES,
  getRoleTypeLabel,
} from '@/lib/rbac/rbacConstants';
import { cn } from '@/lib/shared/utils';

/** Mỗi nhóm quyền (read/create/update/delete) chỉ giữ tối đa một action — ưu tiên :any */
function dedupeActionsByGroup(actions) {
  const picked = [];
  for (const group of RBAC_ACTION_GROUPS) {
    const values = group.actions.map((a) => a.value);
    const inGroup = (actions ?? []).filter((a) => values.includes(a));
    if (inGroup.length === 0) continue;
    const anyAction = group.actions.find((a) => a.value.endsWith(':any'));
    if (anyAction && inGroup.includes(anyAction.value)) {
      picked.push(anyAction.value);
    } else {
      picked.push(inGroup[0]);
    }
  }
  return picked;
}

/** @param {string} actionValue */
function findActionGroup(actionValue) {
  return RBAC_ACTION_GROUPS.find((g) => g.actions.some((a) => a.value === actionValue));
}

export function CreateResourceForm({ onSubmit, disabled }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, slug, description });
        setName('');
        setSlug('');
        setDescription('');
      }}
    >
      <AdminField label="Tên hiển thị" htmlFor="res-name" required>
        <AdminInput
          id="res-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sản phẩm"
        />
      </AdminField>
      <AdminField label="Mã module" htmlFor="res-slug" required hint="Dùng src_name trong RBAC — VD: product, staff">
        <AdminInput
          id="res-slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="product"
        />
      </AdminField>
      <AdminField label="Mô tả" htmlFor="res-desc">
        <AdminInput
          id="res-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Quản lý sản phẩm"
        />
      </AdminField>
      <AdminButton type="submit" disabled={disabled} className="w-full sm:w-auto">
        Thêm module
      </AdminButton>
    </form>
  );
}

export function CreateRoleForm({ onSubmit, disabled, formId = 'create-role-form', hideSubmit = false, open }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [roleType, setRoleType] = useState('STAFF');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setSlug('');
      setRoleType('STAFF');
      setDescription('');
    }
  }, [open]);

  return (
    <form
      id={formId}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, slug, role_type: roleType, description, grants: [] });
        setName('');
        setSlug('');
        setDescription('');
        setRoleType('STAFF');
      }}
    >
      <AdminField label="Tên vai trò" htmlFor="role-name" required>
        <AdminInput
          id="role-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhân viên bán hàng"
        />
      </AdminField>
      <AdminField label="Mã vai trò" htmlFor="role-slug" required>
        <AdminInput
          id="role-slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="nhan_vien_ban_hang"
        />
      </AdminField>
      <AdminField label="Loại tài khoản" htmlFor="role-type" required>
        <AdminSelect id="role-type" value={roleType} onChange={(e) => setRoleType(e.target.value)}>
          {ROLE_TYPES.map((t) => (
            <option key={t} value={t}>{getRoleTypeLabel(t)}</option>
          ))}
        </AdminSelect>
      </AdminField>
      {!hideSubmit && (
        <AdminButtonOutline type="submit" disabled={disabled} className="w-full">
          Tạo vai trò
        </AdminButtonOutline>
      )}
    </form>
  );
}

export function EditRoleForm({ role, onSubmit, disabled }) {
  const [roleName, setRoleName] = useState(role.role_name ?? '');
  const [roleSlug, setRoleSlug] = useState(role.role_slug ?? '');
  const [roleType, setRoleType] = useState(role.role_type ?? 'STAFF');
  const [description, setDescription] = useState(role.role_description ?? '');
  const isProtectedSlug = role.role_slug === 'AD0001';

  const grantsPayload = useMemo(
    () => (role.role_grants ?? [])
      .filter((g) => g && g.resource != null)
      .map((g) => {
        const res = g.resource;
        const resourceId =
          res != null && typeof res === 'object'
            ? String(res._id ?? '')
            : String(res ?? '');
        return {
          resource: resourceId,
          actions: g.actions ?? [],
          attributes: g.attributes ?? '*',
        };
      })
      .filter((g) => g.resource),
    [role.role_grants],
  );

  const hasChanges = useMemo(
    () =>
      roleName !== (role.role_name ?? '')
      || roleSlug.trim() !== (role.role_slug ?? '')
      || roleType !== (role.role_type ?? 'STAFF')
      || description !== (role.role_description ?? ''),
    [roleName, roleSlug, roleType, description, role],
  );

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          role_name: roleName,
          role_slug: roleSlug.trim(),
          role_type: roleType,
          role_description: description,
          grants: grantsPayload,
        });
      }}
    >
      <AdminField label="Tên vai trò" htmlFor="edit-role-name" required>
        <AdminInput
          id="edit-role-name"
          required
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />
      </AdminField>
      <AdminField
        label="Mã vai trò"
        htmlFor="edit-role-slug"
        required
        hint={isProtectedSlug ? 'Mã vai trò quản trị hệ thống không thể đổi' : 'role_slug — dùng trong phân quyền JWT'}
      >
        <AdminInput
          id="edit-role-slug"
          required
          value={roleSlug}
          onChange={(e) => setRoleSlug(e.target.value)}
          disabled={isProtectedSlug || disabled}
          className="font-mono"
          placeholder="STAFF0001"
        />
      </AdminField>
      <AdminField label="Loại tài khoản" htmlFor="edit-role-type" required className="sm:col-span-2">
        <AdminSelect id="edit-role-type" value={roleType} onChange={(e) => setRoleType(e.target.value)}>
          {ROLE_TYPES.map((t) => (
            <option key={t} value={t}>{getRoleTypeLabel(t)}</option>
          ))}
        </AdminSelect>
      </AdminField>
      <AdminField label="Mô tả" htmlFor="edit-role-desc" className="sm:col-span-2">
        <AdminInput
          id="edit-role-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn"
        />
      </AdminField>
      <div className="sm:col-span-2">
        <AdminButton type="submit" disabled={disabled || !hasChanges}>
          Lưu thông tin
        </AdminButton>
      </div>
    </form>
  );
}

export function EditResourceForm({ resource, onSubmit, onCancel, disabled }) {
  const [name, setName] = useState(resource.name ?? resource.src_name ?? '');
  const [slug, setSlug] = useState(resource.slug ?? resource.src_slug ?? '');
  const [description, setDescription] = useState(resource.description ?? resource.src_description ?? '');

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, slug, description });
      }}
    >
      <AdminField label="Tên hiển thị" htmlFor="edit-res-name" required>
        <AdminInput id="edit-res-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </AdminField>
      <AdminField label="Mã module" htmlFor="edit-res-slug" required>
        <AdminInput id="edit-res-slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
      </AdminField>
      <AdminField label="Mô tả" htmlFor="edit-res-desc">
        <AdminInput id="edit-res-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </AdminField>
      <div className="flex flex-wrap gap-2">
        <AdminButton type="submit" disabled={disabled} size="default" className="min-h-9 px-4 text-sm">
          Lưu
        </AdminButton>
        <AdminButtonGhost type="button" disabled={disabled} onClick={onCancel} size="default" className="min-h-9 px-4 text-sm">
          Hủy
        </AdminButtonGhost>
      </div>
    </form>
  );
}

/**
 * Form chọn quyền — dùng cho thêm mới hoặc sửa theo module.
 * @param {'add' | 'edit'} [mode]
 */
export function GrantForm({
  mode = 'add',
  resources,
  moduleLabel,
  initialActions = [],
  initialAttributes = '*',
  onSubmit,
  disabled,
}) {
  const validResources = useMemo(
    () => (resources ?? []).filter((r) => r && (r.resourceId || r._id)),
    [resources],
  );
  const [resourceId, setResourceId] = useState(
    () => validResources[0]?.resourceId ?? validResources[0]?._id ?? '',
  );
  const [actions, setActions] = useState(() => dedupeActionsByGroup(initialActions));
  const [attributes, setAttributes] = useState(initialAttributes);

  /** Mỗi nhóm chỉ chọn 1 — bấm lại nút đang chọn để bỏ quyền nhóm đó */
  function selectActionInGroup(actionValue) {
    setActions((prev) => {
      const group = findActionGroup(actionValue);
      if (!group) return prev;

      const groupValues = group.actions.map((a) => a.value);
      const withoutGroup = prev.filter((a) => !groupValues.includes(a));

      if (prev.includes(actionValue)) {
        return withoutGroup;
      }
      return [...withoutGroup, actionValue];
    });
  }

  const isEdit = mode === 'edit';

  return (
    <form
      className={cn(
        'space-y-4',
        !isEdit && 'border-t border-gray-100 pt-4',
      )}
      onSubmit={(e) => {
        e.preventDefault();
        if (actions.length === 0) return;
        const normalizedActions = dedupeActionsByGroup(actions);
        if (isEdit) {
          onSubmit({ actions: normalizedActions, attributes });
          return;
        }
        if (!resourceId) return;
        onSubmit({ resource: resourceId, actions: normalizedActions, attributes });
      }}
    >
      {!isEdit && (
        <>
          <p className="text-sm font-semibold text-brand-dark">Gán quyền mới</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminField label="Module" htmlFor="grant-resource" required>
              <AdminSelect id="grant-resource" value={resourceId} onChange={(e) => setResourceId(e.target.value)}>
                {validResources.map((res) => {
                  const id = res.resourceId ?? res._id;
                  return (
                    <option key={id} value={id}>
                      {res.name ?? res.src_name}
                    </option>
                  );
                })}
              </AdminSelect>
            </AdminField>
            <AdminField label="Trường dữ liệu" htmlFor="grant-attrs" hint="* = tất cả trường">
              <AdminInput
                id="grant-attrs"
                value={attributes}
                onChange={(e) => setAttributes(e.target.value)}
                placeholder="*"
              />
            </AdminField>
          </div>
        </>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-600">
          {isEdit ? `Quyền · ${moduleLabel}` : 'Chọn quyền'}
        </p>
        <p className="mb-2 text-xs text-gray-400">
          Mỗi nhóm chỉ chọn một phạm vi — tất cả hoặc của mình.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          {RBAC_ACTION_GROUPS.map((group) => (
            <div
              key={group.id}
              className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm"
            >
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {group.label}
              </p>
              <div
                className="grid grid-cols-2 gap-1 rounded-md border border-gray-200 bg-brand-gray/40 p-0.5"
                role="radiogroup"
                aria-label={group.label}
              >
                {group.actions.map((action) => {
                  const selected = actions.includes(action.value);
                  return (
                    <button
                      key={action.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={action.hint}
                      onClick={() => selectActionInGroup(action.value)}
                      className={cn(
                        'min-h-8 rounded px-1.5 py-1.5 text-[10px] font-semibold leading-tight transition-[transform,opacity,background-color,border-color,color] md:min-h-9 md:px-2 md:text-xs',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50',
                        selected
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:text-brand-primary',
                      )}
                    >
                      <span className="sm:hidden">{action.shortLabel ?? action.label}</span>
                      <span className="hidden sm:inline">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {actions.length === 0 && (
          <p className="mt-2 text-xs text-amber-600">Chọn ít nhất một quyền</p>
        )}
      </div>

      {isEdit && (
        <AdminField label="Trường dữ liệu" htmlFor="grant-attrs-edit" hint="* = tất cả trường">
          <AdminInput
            id="grant-attrs-edit"
            value={attributes}
            onChange={(e) => setAttributes(e.target.value)}
            placeholder="*"
          />
        </AdminField>
      )}

      <AdminButton
        type="submit"
        disabled={disabled || actions.length === 0 || (!isEdit && !resourceId)}
        size="default"
        className="min-h-9 px-4 text-sm"
      >
        {isEdit ? 'Lưu quyền' : 'Thêm quyền'}
      </AdminButton>
    </form>
  );
}

export function AddGrantForm({ resources, onSubmit, disabled }) {
  return (
    <GrantForm
      mode="add"
      resources={resources}
      onSubmit={onSubmit}
      disabled={disabled}
    />
  );
}
