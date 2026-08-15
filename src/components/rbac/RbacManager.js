'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createResourceAction,
  createRoleAction,
  updateRoleAction,
  insertRoleGrantsAction,
  updateRoleGrantAction,
  removeRoleGrantAction,
  updateResourceAction,
  deleteResourceAction,
  deleteRoleAction,
} from '@/lib/actions/rbac';
import { showError, showSuccess, showWarning } from '@/lib/shared/toast';
import { cn } from '@/lib/shared/utils';
import {
  ADMIN_COMPACT_CLASS,
  AdminButton,
  AdminButtonOutline,
  FormCard,
} from '@/components/admin';
import {
  AddGrantForm,
  CreateResourceForm,
  EditResourceForm,
  EditRoleForm,
  GrantForm,
} from '@/components/rbac/RbacForms';
import { CreateRoleDialog } from '@/components/rbac/CreateRoleDialog';
import {
  RBAC_TABLE_CELL,
  RBAC_TABLE_HEAD,
  RbacActionBadge,
  RbacEmptyState,
  RbacReadOnlyBanner,
  RbacTabBar,
  RoleTypeBadge,
} from '@/components/rbac/RbacShared';
import ListPagination from '@/components/common/ListPagination';

/**
 * @param {{
 *   activeTab: string,
 *   roleMatrix: object[],
 *   roleMatrixTotal: number,
 *   roles: object[],
 *   resources: object[],
 *   allResources: object[],
 *   resourcesTotal: number,
 *   fetchError?: string,
 *   canManage?: boolean,
 *   pagination?: { page: number, limit: number, total: number, itemLabel: string } | null,
 *   querySuffix?: string,
 * }} props
 */
export default function RbacManager({
  activeTab,
  roleMatrix,
  roleMatrixTotal,
  roles,
  resources,
  allResources,
  resourcesTotal,
  fetchError,
  canManage = false,
  pagination = null,
  querySuffix = '',
}) {
  const router = useRouter();
  const safeRoles = useMemo(() => (roles ?? []).filter((r) => r && r._id), [roles]);
  const safeResources = useMemo(
    () => (allResources ?? resources ?? []).filter((r) => r && (r._id || r.resourceId)),
    [allResources, resources],
  );
  const [selectedRoleId, setSelectedRoleId] = useState(() => safeRoles[0]?._id ?? '');
  const [isPending, startTransition] = useTransition();
  const [editingGrantResourceId, setEditingGrantResourceId] = useState(null);
  const [editingResourceId, setEditingResourceId] = useState(null);

  useEffect(() => {
    if (!safeRoles.some((r) => String(r._id) === String(selectedRoleId))) {
      setSelectedRoleId(safeRoles[0]?._id ?? '');
    }
  }, [safeRoles, selectedRoleId]);

  const tabCounts = useMemo(
    () => ({
      matrix: roleMatrixTotal,
      roles: safeRoles.length,
      resources: resourcesTotal,
    }),
    [roleMatrixTotal, safeRoles.length, resourcesTotal],
  );

  useEffect(() => {
    if (fetchError && (safeRoles.length || safeResources.length)) {
      showWarning('Không tải đủ dữ liệu', fetchError);
    }
  }, [fetchError, safeRoles.length, safeResources.length]);

  const selectedRole = useMemo(
    () => safeRoles.find((r) => String(r._id) === String(selectedRoleId)) ?? null,
    [safeRoles, selectedRoleId],
  );

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  function handleResult(res, okMsg) {
    if (res?.error) {
      showError('Thao tác thất bại', res.error);
      return;
    }
    showSuccess(okMsg);
    refresh();
  }

  if (fetchError && !safeRoles.length && !safeResources.length) {
    return null;
  }

  return (
    <div className="space-y-5">
      {!canManage && <RbacReadOnlyBanner />}

      <RbacTabBar
        activeTab={activeTab}
        counts={tabCounts}
      />

      {activeTab === 'matrix' && (
        <RbacMatrixPanel
          roleMatrix={roleMatrix}
          roleMatrixTotal={roleMatrixTotal}
          pagination={pagination}
          querySuffix={querySuffix}
        />
      )}

      {activeTab === 'roles' && (
        <RbacRolesPanel
          safeRoles={safeRoles}
          safeResources={safeResources}
          selectedRoleId={selectedRoleId}
          selectedRole={selectedRole}
          canManage={canManage}
          isPending={isPending}
          editingGrantResourceId={editingGrantResourceId}
          onSelectRole={(id) => {
            setSelectedRoleId(id);
            setEditingGrantResourceId(null);
          }}
          onSetEditingGrant={setEditingGrantResourceId}
          onCreateRole={(data, onSuccess) => {
            startTransition(async () => {
              const res = await createRoleAction(data);
              if (res?.error) {
                showError('Thao tác thất bại', res.error);
                return;
              }
              showSuccess('Đã tạo vai trò mới');
              refresh();
              onSuccess?.();
            });
          }}
          onUpdateRole={(data) => {
            startTransition(async () => {
              handleResult(await updateRoleAction(selectedRole._id, data), 'Đã lưu thông tin vai trò');
            });
          }}
          onRemoveGrant={(resourceId) => {
            if (!window.confirm('Xóa quyền trên module này?')) return;
            startTransition(async () => {
              handleResult(
                await removeRoleGrantAction(selectedRole._id, resourceId),
                'Đã xóa quyền module',
              );
              setEditingGrantResourceId(null);
            });
          }}
          onUpdateGrant={(resourceId, payload) => {
            startTransition(async () => {
              handleResult(
                await updateRoleGrantAction(selectedRole._id, resourceId, payload),
                'Đã cập nhật quyền module',
              );
              setEditingGrantResourceId(null);
            });
          }}
          onAddGrant={(grant) => {
            startTransition(async () => {
              handleResult(
                await insertRoleGrantsAction(selectedRole._id, [grant]),
                'Đã thêm quyền cho vai trò',
              );
            });
          }}
          onDeleteRole={() => {
            if (!window.confirm(`Xóa vai trò "${selectedRole.role_name}"?`)) return;
            startTransition(async () => {
              const res = await deleteRoleAction(selectedRole._id);
              if (res?.error) {
                showError('Thao tác thất bại', res.error);
                return;
              }
              showSuccess('Đã xóa vai trò');
              setEditingGrantResourceId(null);
              setSelectedRoleId('');
              refresh();
            });
          }}
        />
      )}

      {activeTab === 'resources' && (
        <RbacResourcesPanel
          safeResources={resources}
          resourcesTotal={resourcesTotal}
          canManage={canManage}
          isPending={isPending}
          editingResourceId={editingResourceId}
          pagination={pagination}
          querySuffix={querySuffix}
          onSetEditingResource={setEditingResourceId}
          onCreateResource={(data) => {
            startTransition(async () => {
              handleResult(await createResourceAction(data), 'Đã thêm module mới');
            });
          }}
          onUpdateResource={(id, data) => {
            startTransition(async () => {
              handleResult(await updateResourceAction(id, data), 'Đã cập nhật module');
              setEditingResourceId(null);
            });
          }}
          onDeleteResource={(id, name) => {
            if (!window.confirm(`Xóa module "${name}"?`)) return;
            startTransition(async () => {
              handleResult(await deleteResourceAction(id), 'Đã xóa module');
              setEditingResourceId(null);
            });
          }}
        />
      )}
    </div>
  );
}

function RbacMatrixPanel({ roleMatrix, roleMatrixTotal, pagination, querySuffix }) {
  if (!roleMatrixTotal) {
    return (
      <RbacEmptyState
        title="Chưa có quyền nào được gán"
        description='Tạo vai trò và gán quyền ở tab "Vai trò & quyền".'
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-brand-gray">
              <th className={cn(RBAC_TABLE_HEAD, 'w-[20%]')}>Tên vai trò</th>
              <th className={cn(RBAC_TABLE_HEAD, 'w-[14%] border-l border-gray-200')}>Mã vai trò</th>
              <th className={cn(RBAC_TABLE_HEAD, 'w-[14%] border-l border-gray-200')}>Module</th>
              <th className={cn(RBAC_TABLE_HEAD, 'w-[28%] border-l border-gray-200')}>Quyền</th>
              <th className={cn(RBAC_TABLE_HEAD, 'w-[24%] border-l border-gray-200')}>Trường dữ liệu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roleMatrix.map((row) => {
              const modules = row.modules ?? [];
              if (!modules.length) return null;

              return modules.map((mod, modIdx) => (
                <tr
                  key={`${row.role}-${mod.resource}`}
                  className="transition-colors hover:bg-brand-gray/50"
                >
                  {modIdx === 0 ? (
                    <>
                      <td
                        rowSpan={modules.length}
                        className={cn(RBAC_TABLE_CELL, 'border-r border-gray-100 pl-3 align-top font-semibold text-brand-dark')}
                        title={row.roleName}
                      >
                        <span className="block truncate">{row.roleName}</span>
                      </td>
                      <td
                        rowSpan={modules.length}
                        className={cn(RBAC_TABLE_CELL, 'border-r border-gray-100 align-top font-mono text-xs text-gray-600')}
                        title={row.role}
                      >
                        <span className="block truncate">{row.role}</span>
                      </td>
                    </>
                  ) : null}
                  <td
                    className={cn(RBAC_TABLE_CELL, 'border-l border-gray-100 text-gray-600')}
                    title={mod.resource}
                  >
                    <span className="block truncate">{mod.resource}</span>
                  </td>
                  <td className={cn(RBAC_TABLE_CELL, 'border-l border-gray-100')}>
                    <div className="flex flex-wrap items-center gap-1">
                      {(mod.actions ?? []).map((action) => (
                        <RbacActionBadge key={`${mod.resource}-${action}`} action={action} compact />
                      ))}
                    </div>
                  </td>
                  <td
                    className={cn(RBAC_TABLE_CELL, 'border-l border-gray-100 pr-3 font-mono text-xs text-gray-500')}
                    title={mod.attributes ?? '*'}
                  >
                    {mod.attributes ?? '*'}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <ListPagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          querySuffix={querySuffix}
          itemLabel={pagination.itemLabel}
        />
      )}
    </div>
  );
}

function RbacRolesPanel({
  safeRoles,
  safeResources,
  selectedRoleId,
  selectedRole,
  canManage,
  isPending,
  editingGrantResourceId,
  onSelectRole,
  onSetEditingGrant,
  onCreateRole,
  onUpdateRole,
  onRemoveGrant,
  onUpdateGrant,
  onAddGrant,
  onDeleteRole,
}) {
  const [editingRole, setEditingRole] = useState(false);
  const [showAddGrant, setShowAddGrant] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);

  useEffect(() => {
    setEditingRole(false);
    setShowAddGrant(false);
  }, [selectedRoleId]);

  const isProtectedRole = selectedRole?.role_slug === 'AD0001';

  function handleCreateRole(data) {
    onCreateRole(data, () => setShowCreateRole(false));
  }

  const createRoleButton = canManage ? (
    <AdminButton
      type="button"
      disabled={isPending}
      onClick={() => setShowCreateRole(true)}
      size="default"
      className={ADMIN_COMPACT_CLASS}
    >
      Tạo chức vụ
    </AdminButton>
  ) : null;

  const createRoleModal = canManage ? (
    <CreateRoleDialog
      open={showCreateRole}
      onOpenChange={setShowCreateRole}
      disabled={isPending}
      onSubmit={handleCreateRole}
    />
  ) : null;

  if (!safeRoles.length) {
    return (
      <div className="space-y-4">
        <RbacEmptyState
          title="Chưa có vai trò"
          description="Tạo vai trò đầu tiên để bắt đầu phân quyền."
        />
        {canManage && (
          <div className="flex justify-center">
            <AdminButton type="button" disabled={isPending} onClick={() => setShowCreateRole(true)}>
              Tạo chức vụ
            </AdminButton>
          </div>
        )}
        {createRoleModal}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,280px)_1fr]">
      <FormCard
        title="Chức vụ"
        badge={`${safeRoles.length}`}
        compact
        actions={createRoleButton}
      >
        <ul className="max-h-[480px] space-y-1 overflow-y-auto">
          {safeRoles.map((role) => {
            const active = selectedRoleId === role._id;
            return (
              <li key={role._id}>
                <button
                  type="button"
                  onClick={() => onSelectRole(role._id)}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                    active
                      ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                      : 'border-transparent bg-brand-gray/60 text-gray-700 hover:border-gray-200 hover:bg-brand-gray',
                  )}
                >
                  <p className="truncate font-semibold leading-snug">{role.role_name}</p>
                  <p className={cn('mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-xs leading-tight', active && 'text-white/75')}>
                    <RoleTypeBadge roleType={role.role_type} active={active} />
                    <span className={cn(active ? 'text-white/75' : 'text-gray-400')}>·</span>
                    <span className={cn('truncate font-mono', active ? 'text-white/75' : 'text-gray-500')}>
                      {role.role_slug}
                    </span>
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </FormCard>

      <FormCard
        title={selectedRole ? selectedRole.role_name : 'Chi tiết vai trò'}
        badge={selectedRole ? `${(selectedRole.role_grants ?? []).length} module` : undefined}
        hint={selectedRole ? <RoleTypeBadge roleType={selectedRole.role_type} /> : 'Chọn chức vụ bên trái'}
        compact
        actions={
          selectedRole && canManage ? (
            <>
              <AdminButtonOutline
                type="button"
                disabled={isPending}
                onClick={() => {
                  setEditingRole((open) => !open);
                  if (!editingRole) setShowAddGrant(false);
                }}
                size="default"
                className={cn(
                  ADMIN_COMPACT_CLASS,
                  'border-amber-400 bg-amber-50 text-amber-900 hover:border-amber-500 hover:bg-amber-100 hover:text-amber-950',
                  editingRole && 'border-amber-500 bg-amber-200',
                )}
              >
                {editingRole ? 'Đóng' : 'Sửa'}
              </AdminButtonOutline>
              <AdminButton
                type="button"
                disabled={isPending}
                onClick={() => {
                  setShowAddGrant((open) => !open);
                  setEditingRole(false);
                  onSetEditingGrant(null);
                }}
                size="default"
                className={cn(
                  ADMIN_COMPACT_CLASS,
                  'border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700 hover:text-white',
                  showAddGrant && 'border-blue-700 bg-blue-700',
                )}
              >
                {showAddGrant ? 'Đóng' : 'Thêm quyền'}
              </AdminButton>
              <AdminButton
                type="button"
                variant="destructive"
                disabled={isPending || isProtectedRole}
                title={isProtectedRole ? 'Không thể xóa vai trò quản trị hệ thống' : undefined}
                onClick={onDeleteRole}
                size="default"
                className={ADMIN_COMPACT_CLASS}
              >
                Xóa
              </AdminButton>
            </>
          ) : null
        }
      >
        {selectedRole ? (
          <div className="space-y-5">
            {canManage && editingRole ? (
              <EditRoleForm
                role={selectedRole}
                disabled={isPending}
                onSubmit={(data) => {
                  onUpdateRole(data);
                  setEditingRole(false);
                }}
              />
            ) : (
              <RoleSummary role={selectedRole} />
            )}

            <div className={cn('space-y-3', editingRole && 'border-t border-gray-100 pt-4')}>
              <p className="text-sm font-semibold text-brand-dark">Quyền theo module</p>

              {(selectedRole.role_grants ?? []).length === 0 && !showAddGrant ? (
                <p className="rounded-lg border border-dashed border-gray-200 bg-brand-gray/30 px-4 py-6 text-center text-sm text-gray-400">
                  Chưa gán quyền trên module nào
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] table-fixed border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-brand-gray">
                          <th className={cn(RBAC_TABLE_HEAD, 'w-[22%]')}>Module</th>
                          <th className={cn(RBAC_TABLE_HEAD, 'w-[38%] border-l border-gray-200')}>Quyền</th>
                          <th className={cn(RBAC_TABLE_HEAD, 'w-[14%] border-l border-gray-200')}>Trường dữ liệu</th>
                          {canManage && (
                            <th className={cn(RBAC_TABLE_HEAD, 'w-[26%] border-l border-gray-200')}>
                              Thao tác
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(selectedRole.role_grants ?? []).map((g, idx) => {
                          const res = g.resource;
                          const resourceId =
                            res != null && typeof res === 'object'
                              ? String(res._id ?? '')
                              : String(res ?? '');
                          const isEditing = editingGrantResourceId === resourceId;
                          const moduleName = g.resource?.src_name ?? g.resource?.toString?.() ?? 'Module';
                          const colSpan = canManage ? 4 : 3;

                          if (isEditing && canManage) {
                            return (
                              <tr key={resourceId || idx} className="bg-brand-gray/30">
                                <td colSpan={colSpan} className="p-0">
                                  <div className="border-b border-gray-200 bg-brand-gray/50 px-3 py-2.5">
                                    <p className="truncate font-semibold text-brand-dark">{moduleName}</p>
                                  </div>
                                  <div className="px-3 py-3">
                                    <GrantForm
                                      mode="edit"
                                      moduleLabel={moduleName}
                                      initialActions={g.actions ?? []}
                                      initialAttributes={g.attributes ?? '*'}
                                      disabled={isPending}
                                      onSubmit={(payload) => onUpdateGrant(resourceId, payload)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr
                              key={resourceId || idx}
                              className="transition-colors hover:bg-brand-gray/50"
                            >
                              <td
                                className={cn(RBAC_TABLE_CELL, 'pl-3 font-semibold text-brand-dark truncate')}
                                title={moduleName}
                              >
                                {moduleName}
                              </td>
                              <td className={cn(RBAC_TABLE_CELL, 'border-l border-gray-100')}>
                                <div className="flex flex-wrap items-center gap-1">
                                  {(g.actions ?? []).map((action) => (
                                    <RbacActionBadge key={action} action={action} compact />
                                  ))}
                                </div>
                              </td>
                              <td
                                className={cn(RBAC_TABLE_CELL, 'border-l border-gray-100 font-mono text-xs text-brand-dark truncate')}
                                title={g.attributes ?? '*'}
                              >
                                {g.attributes ?? '*'}
                              </td>
                              {canManage && (
                                <td className={cn(RBAC_TABLE_CELL, 'border-l border-gray-100 pr-3')}>
                                  <div className="flex justify-end gap-1.5">
                                    <AdminButtonOutline
                                      type="button"
                                      disabled={isPending}
                                      onClick={() => onSetEditingGrant(resourceId)}
                                      size="default"
                                      className={cn(
                                        ADMIN_COMPACT_CLASS,
                                        'border-amber-400 bg-amber-50 text-amber-900 hover:border-amber-500 hover:bg-amber-100 hover:text-amber-950',
                                      )}
                                    >
                                      Sửa
                                    </AdminButtonOutline>
                                    <AdminButton
                                      type="button"
                                      variant="destructive"
                                      disabled={isPending}
                                      onClick={() => onRemoveGrant(resourceId)}
                                      size="default"
                                      className={ADMIN_COMPACT_CLASS}
                                    >
                                      Xóa
                                    </AdminButton>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {canManage && showAddGrant && (
                <AddGrantForm
                  resources={safeResources}
                  disabled={isPending}
                  onSubmit={onAddGrant}
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chọn vai trò ở cột bên trái để xem chi tiết.</p>
        )}
      </FormCard>
    </div>
    {createRoleModal}
    </>
  );
}

function RoleSummary({ role }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-brand-gray/50 px-4 py-3 text-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400">Loại tài khoản</p>
          <div className="mt-0.5">
            <RoleTypeBadge roleType={role.role_type} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400">Mã vai trò</p>
          <p className="mt-0.5 truncate font-mono font-medium text-brand-dark">{role.role_slug}</p>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400">Mô tả</p>
          {role.role_description ? (
            <p className="mt-0.5 text-gray-600">{role.role_description}</p>
          ) : (
            <p className="mt-0.5 text-gray-400">Chưa có mô tả</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RbacResourcesPanel({
  safeResources,
  resourcesTotal,
  canManage,
  isPending,
  editingResourceId,
  pagination,
  querySuffix,
  onSetEditingResource,
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-4', canManage && 'lg:grid-cols-[1fr_minmax(280px,360px)]')}>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <FormCard
          title="Module hệ thống"
          badge={`${resourcesTotal}`}
          hint="src_name dùng trong navConfig và grantAccess backend"
          compact
          className="border-0 shadow-none ring-0"
        >
          {resourcesTotal === 0 ? (
            <RbacEmptyState
              title="Chưa có module"
              description="Thêm module mới để gán quyền cho vai trò."
              icon="module"
            />
          ) : (
            <ul className="space-y-2">
              {safeResources.map((res) => {
              const id = res.resourceId ?? res._id;
              const slug = res.slug ?? res.src_slug ?? '';
              const isEditing = editingResourceId === id;

              return (
                <li key={id} className="rounded-lg border border-gray-200 bg-brand-gray/30 px-3 py-3">
                  {!isEditing ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-brand-dark">
                            {res.name ?? res.src_name}
                          </p>
                          <p className="font-mono text-xs text-gray-500">Mã: {slug}</p>
                          {(res.description ?? res.src_description) && (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                              {res.description ?? res.src_description}
                            </p>
                          )}
                        </div>
                        {canManage && (
                          <div className="flex shrink-0 gap-1.5">
                            <AdminButtonOutline
                              type="button"
                              disabled={isPending}
                              onClick={() => onSetEditingResource(id)}
                              size="default"
                              className={ADMIN_COMPACT_CLASS}
                            >
                              Sửa
                            </AdminButtonOutline>
                            <AdminButton
                              type="button"
                              variant="destructive"
                              disabled={isPending || slug === 'rbac'}
                              title={slug === 'rbac' ? 'Không thể xóa module rbac' : undefined}
                              onClick={() => onDeleteResource(id, res.name ?? res.src_name)}
                              size="default"
                              className={ADMIN_COMPACT_CLASS}
                            >
                              Xóa
                            </AdminButton>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <EditResourceForm
                      resource={res}
                      disabled={isPending}
                      onCancel={() => onSetEditingResource(null)}
                      onSubmit={(data) => onUpdateResource(id, data)}
                    />
                  )}
                </li>
              );
            })}
            </ul>
          )}
        </FormCard>

        {pagination && resourcesTotal > 0 && (
          <ListPagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            querySuffix={querySuffix}
            itemLabel={pagination.itemLabel}
          />
        )}
      </div>

      {canManage && (
        <FormCard title="Thêm module" hint="Tạo resource mới trước khi gán quyền" compact>
          <CreateResourceForm disabled={isPending} onSubmit={onCreateResource} />
        </FormCard>
      )}
    </div>
  );
}
