/**
 * RBAC API — /api/v1/rbac/*
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';

/**
 * @param {any} raw
 * @returns {any[]}
 */
function unwrapList(raw) {
  const meta = raw?.metadata ?? raw;
  if (Array.isArray(meta)) return meta;
  if (Array.isArray(meta?.data)) return meta.data;
  return [];
}

/**
 * @param {any} raw
 * @returns {any}
 */
function unwrapOne(raw) {
  return raw?.metadata ?? raw;
}

/** GET /rbac/roles — bảng phẳng role/resource/action */
export async function getRoleGrantMatrix() {
  const raw = await apiGet('/rbac/roles', { tags: ['rbac-roles'], revalidate: 0 });
  return unwrapList(raw);
}

/** GET /rbac/roles/documents — role đầy đủ kèm grants */
export async function getRoleDocuments() {
  const raw = await apiGet('/rbac/roles/documents', { tags: ['rbac-roles'], revalidate: 0 });
  return unwrapList(raw);
}

/** GET /rbac/resources */
export async function getResources() {
  const raw = await apiGet('/rbac/resources', { tags: ['rbac-resources'], revalidate: 0 });
  return unwrapList(raw);
}

/** POST /rbac/newresource */
export function createResource(body) {
  return apiPost('/rbac/newresource', body);
}

/** POST /rbac/newrole */
export function createRole(body) {
  return apiPost('/rbac/newrole', body);
}

/** PATCH /rbac/updaterole/:roleId */
export function updateRole(roleId, body) {
  return apiPatch(`/rbac/updaterole/${roleId}`, body);
}

/** POST /rbac/insertrole/:roleId */
export function insertRoleGrants(roleId, body) {
  return apiPost(`/rbac/insertrole/${roleId}`, body);
}

/** PATCH /rbac/updaterole/:roleId/grant/:resourceId — sửa quyền theo module */
export function updateRoleGrant(roleId, resourceId, body) {
  return apiPatch(`/rbac/updaterole/${roleId}/grant/${resourceId}`, body);
}

/** DELETE /rbac/updaterole/:roleId/grant/:resourceId — xóa quyền module */
export function removeRoleGrant(roleId, resourceId) {
  return apiDelete(`/rbac/updaterole/${roleId}/grant/${resourceId}`);
}

/** PATCH /rbac/updateresource/:resourceId */
export function updateResource(resourceId, body) {
  return apiPatch(`/rbac/updateresource/${resourceId}`, body);
}

/** DELETE /rbac/resources/:resourceId */
export function deleteResource(resourceId) {
  return apiDelete(`/rbac/resources/${resourceId}`);
}

/** DELETE /rbac/roles/:roleId */
export function deleteRole(roleId) {
  return apiDelete(`/rbac/roles/${roleId}`);
}

export { unwrapList, unwrapOne };
