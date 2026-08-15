'use server';

import { updateTag } from 'next/cache';
import {
  createResource,
  createRole,
  updateRole,
  insertRoleGrants,
  updateRoleGrant,
  removeRoleGrant,
  updateResource,
  deleteResource,
  deleteRole,
} from '@/lib/api/rbac';
import { normalizeGrantsPayload, normalizeRbacAction } from '@/lib/rbac/rbacConstants';
import {
  createResourceSchema,
  createRoleSchema,
  updateRoleSchema,
  updateResourceSchema,
  insertGrantsSchema,
  updateGrantSchema,
  idSchema,
  formatRbacSchemaError,
} from '@/lib/rbac/rbacSchema';
import { requirePermission } from '@/lib/auth/assertPermission';
import { mutationErrorMessage } from '@/lib/shared/actionError';

function revalidateRbac() {
  updateTag('rbac-roles');
  updateTag('rbac-resources');
}

/**
 * @param {object} data — { name, slug, description }
 */
export async function createResourceAction(data) {
  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  const parsed = createResourceSchema.safeParse(data);
  if (!parsed.success) return { error: formatRbacSchemaError(parsed.error) };

  try {
    await createResource({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? '',
    });
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Tạo resource thất bại') };
  }
}

/**
 * @param {object} data — { name, slug, role_type, description, grants? }
 */
export async function createRoleAction(data) {
  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  const parsed = createRoleSchema.safeParse(data);
  if (!parsed.success) return { error: formatRbacSchemaError(parsed.error) };

  try {
    await createRole({
      name: parsed.data.name,
      slug: parsed.data.slug,
      role_type: parsed.data.role_type,
      description: parsed.data.description ?? '',
      grants: normalizeGrantsPayload(parsed.data.grants ?? []),
    });
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Tạo role thất bại') };
  }
}

/**
 * @param {string} roleId
 * @param {object} data
 */
export async function updateRoleAction(roleId, data) {
  const idParsed = idSchema.safeParse(roleId);
  if (!idParsed.success) return { error: 'Thiếu roleId' };

  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  const parsed = updateRoleSchema.safeParse(data);
  if (!parsed.success) return { error: formatRbacSchemaError(parsed.error) };

  try {
    await updateRole(roleId, {
      role_name: parsed.data.role_name,
      role_slug: parsed.data.role_slug,
      role_description: parsed.data.role_description,
      role_type: parsed.data.role_type,
      grants: normalizeGrantsPayload(parsed.data.grants ?? []),
    });
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Cập nhật role thất bại') };
  }
}

/**
 * @param {string} roleId
 * @param {object[]} grants
 */
export async function insertRoleGrantsAction(roleId, grants) {
  const idParsed = idSchema.safeParse(roleId);
  if (!idParsed.success) return { error: 'Thiếu roleId' };

  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  const parsed = insertGrantsSchema.safeParse(grants);
  if (!parsed.success) return { error: formatRbacSchemaError(parsed.error) };

  try {
    await insertRoleGrants(roleId, { grants: normalizeGrantsPayload(parsed.data) });
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Thêm quyền thất bại') };
  }
}

/**
 * @param {string} roleId
 * @param {string} resourceId
 * @param {{ actions: string[], attributes?: string }} data
 */
export async function updateRoleGrantAction(roleId, resourceId, data) {
  if (!idSchema.safeParse(roleId).success || !idSchema.safeParse(resourceId).success) {
    return { error: 'Thiếu roleId hoặc module' };
  }

  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  const parsed = updateGrantSchema.safeParse(data);
  if (!parsed.success) return { error: formatRbacSchemaError(parsed.error) };

  try {
    await updateRoleGrant(roleId, resourceId, {
      actions: parsed.data.actions.map(normalizeRbacAction),
      attributes: parsed.data.attributes ?? '*',
    });
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Cập nhật quyền thất bại') };
  }
}

/**
 * @param {string} roleId
 * @param {string} resourceId
 */
export async function removeRoleGrantAction(roleId, resourceId) {
  if (!idSchema.safeParse(roleId).success || !idSchema.safeParse(resourceId).success) {
    return { error: 'Thiếu roleId hoặc module' };
  }

  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  try {
    await removeRoleGrant(roleId, resourceId);
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xóa quyền thất bại') };
  }
}

/**
 * @param {string} resourceId
 * @param {object} data
 */
export async function updateResourceAction(resourceId, data) {
  const idParsed = idSchema.safeParse(resourceId);
  if (!idParsed.success) return { error: 'Thiếu resourceId' };

  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  const parsed = updateResourceSchema.safeParse(data);
  if (!parsed.success) return { error: formatRbacSchemaError(parsed.error) };

  try {
    await updateResource(resourceId, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? '',
    });
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Cập nhật module thất bại') };
  }
}

/**
 * @param {string} resourceId
 */
export async function deleteResourceAction(resourceId) {
  const idParsed = idSchema.safeParse(resourceId);
  if (!idParsed.success) return { error: 'Thiếu resourceId' };

  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  try {
    await deleteResource(resourceId);
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xóa module thất bại') };
  }
}

/**
 * @param {string} roleId
 */
export async function deleteRoleAction(roleId) {
  const idParsed = idSchema.safeParse(roleId);
  if (!idParsed.success) return { error: 'Thiếu roleId' };

  const denied = await requirePermission('update:any', 'rbac');
  if (denied) return denied;

  try {
    await deleteRole(roleId);
    revalidateRbac();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xóa vai trò thất bại') };
  }
}
