/**
 * Chuẩn hóa dữ liệu RBAC từ MongoDB trước khi truyền sang Client Component.
 */

import { normalizeRbacAction, RBAC_ACTIONS } from '@/lib/rbac/rbacConstants';

function toId(value) {
  if (value == null) return '';
  if (typeof value === 'object' && value._id != null) return String(value._id);
  return String(value);
}

/** Gộp grant trùng module — mỗi resource chỉ một card trên UI */
function mergeRoleGrantsByResource(grants) {
  /** @type {Map<string, object>} */
  const byResource = new Map();

  for (const grant of grants ?? []) {
    if (!grant?.resource) continue;

    const res = grant.resource;
    const resourceId =
      res != null && typeof res === 'object'
        ? toId(res._id ?? res)
        : toId(res);
    if (!resourceId) continue;

    const actions = (grant.actions ?? []).map(normalizeRbacAction);
    const existing = byResource.get(resourceId);

    if (!existing) {
      byResource.set(resourceId, {
        ...grant,
        actions: [...new Set(actions)],
        resource:
          res != null && typeof res === 'object'
            ? {
                ...res,
                _id: resourceId,
                src_name: res.src_name ?? '',
                src_slug: res.src_slug ?? '',
              }
            : resourceId,
      });
      continue;
    }

    existing.actions = [...new Set([...(existing.actions ?? []), ...actions])];
  }

  return Array.from(byResource.values());
}

/** @param {any[]} roles */
export function normalizeRoles(roles) {
  return (roles ?? [])
    .filter(Boolean)
    .map((role) => ({
      ...role,
      _id: toId(role._id),
      role_grants: mergeRoleGrantsByResource(
        (role.role_grants ?? [])
          .filter(Boolean)
          .map((grant) => {
            const res = grant.resource;
            const resourceId =
              res != null && typeof res === 'object'
                ? toId(res._id ?? res)
                : toId(res);

            return {
              ...grant,
              actions: (grant.actions ?? []).map(normalizeRbacAction),
              resource:
                res != null && typeof res === 'object'
                  ? {
                      ...res,
                      _id: resourceId,
                      src_name: res.src_name ?? '',
                      src_slug: res.src_slug ?? '',
                    }
                  : resourceId,
            };
          })
          .filter((g) => g.resource && (typeof g.resource === 'string' ? g.resource : g.resource._id)),
      ),
    }));
}

/** @param {any[]} resources */
export function normalizeResources(resources) {
  return (resources ?? [])
    .filter(Boolean)
    .map((res) => ({
      ...res,
      resourceId: toId(res.resourceId ?? res._id),
      _id: toId(res._id ?? res.resourceId),
      name: res.name ?? res.src_name ?? '',
      slug: res.slug ?? res.src_slug ?? '',
      description: res.description ?? res.src_description ?? '',
    }));
}

/** @param {any[]} matrix — mỗi phần tử có role, resource, action (phẳng từ API) */
function groupRoleMatrixRows(matrix) {
  /** @type {Map<string, { role: string, resource: string, actions: Set<string>, attributes: string }>} */
  const grouped = new Map();

  for (const row of matrix ?? []) {
    if (!row?.role || !row?.resource) continue;
    const action = normalizeRbacAction(row.action);
    if (!action) continue;

    const key = `${row.role}\0${row.resource}`;
    let entry = grouped.get(key);
    if (!entry) {
      entry = {
        role: String(row.role),
        resource: String(row.resource),
        actions: new Set(),
        attributes: row.attributes ?? '*',
      };
      grouped.set(key, entry);
    }
    entry.actions.add(action);
  }

  const actionRank = new Map(RBAC_ACTIONS.map((a, i) => [a, i]));

  return Array.from(grouped.values())
    .map((entry) => ({
      role: entry.role,
      resource: entry.resource,
      actions: [...entry.actions].sort((a, b) => {
        const ra = actionRank.get(a) ?? 999;
        const rb = actionRank.get(b) ?? 999;
        if (ra !== rb) return ra - rb;
        return a.localeCompare(b);
      }),
      attributes: entry.attributes ?? '*',
    }))
    .sort((a, b) => {
      const byRole = a.role.localeCompare(b.role);
      if (byRole !== 0) return byRole;
      return a.resource.localeCompare(b.resource);
    });
}

/** @param {any[]} matrix */
export function normalizeRoleMatrix(matrix) {
  const flat = (matrix ?? [])
    .filter(Boolean)
    .map((row) => ({
      ...row,
      action: normalizeRbacAction(row.action),
    }));

  return groupRoleMatrixRows(flat);
}

/**
 * Gắn role_name vào ma trận (API chỉ trả role_slug).
 * @param {ReturnType<typeof normalizeRoleMatrix>} matrix
 * @param {ReturnType<typeof normalizeRoles>} roles
 */
export function enrichRoleMatrixWithNames(matrix, roles) {
  const nameBySlug = new Map(
    (roles ?? []).map((r) => [String(r.role_slug ?? ''), String(r.role_name ?? '').trim()]),
  );

  return (matrix ?? []).map((row) => ({
    ...row,
    roleName: nameBySlug.get(row.role) || row.role,
  }));
}

/**
 * Gộp ma trận theo vai trò — 1 dòng = 1 chức vụ, nhiều module trong cùng dòng.
 * @param {ReturnType<typeof enrichRoleMatrixWithNames>} matrix
 */
export function groupRoleMatrixByRole(matrix) {
  /** @type {Map<string, { role: string, roleName: string, modules: { resource: string, actions: string[], attributes: string }[] }>} */
  const byRole = new Map();

  for (const row of matrix ?? []) {
    if (!row?.role) continue;

    let entry = byRole.get(row.role);
    if (!entry) {
      entry = {
        role: String(row.role),
        roleName: row.roleName ?? row.role,
        modules: [],
      };
      byRole.set(row.role, entry);
    }

    entry.modules.push({
      resource: String(row.resource ?? ''),
      actions: row.actions ?? [],
      attributes: row.attributes ?? '*',
    });
  }

  return Array.from(byRole.values())
    .map((entry) => ({
      ...entry,
      modules: [...entry.modules].sort((a, b) => a.resource.localeCompare(b.resource)),
    }))
    .sort((a, b) => a.role.localeCompare(b.role));
}
