import { Suspense } from 'react';
import DynamicRbacManager from '@/components/rbac/DynamicRbacManager';
import { getRoleDocuments, getRoleGrantMatrix, getResources } from '@/lib/api/rbac';
import { normalizeRoleMatrix, normalizeResources, normalizeRoles, enrichRoleMatrixWithNames, groupRoleMatrixByRole } from '@/lib/rbac/rbacNormalize';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { paginateList } from '@/lib/shared/listPagination';
import { buildRbacQuerySuffix, parseRbacListParams } from '@/lib/rbac/rbacListQuery';
import { PageHeader, AdminErrorState } from '@/components/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Phân quyền',
  robots: { index: false },
};

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function RbacPage({ searchParams }) {
  const params = await searchParams;
  const { tab, page, limit } = parseRbacListParams(params);

  let roleMatrix = [];
  let roles = [];
  let resources = [];
  let fetchError = null;

  try {
    [roleMatrix, roles, resources] = await Promise.all([
      getRoleGrantMatrix(),
      getRoleDocuments(),
      getResources(),
    ]);
  } catch {
    fetchError = 'Không tải được dữ liệu phân quyền';
  }

  const permissions = await getCachedMyPermissions();
  const rbacCaps = getResourceCapabilities('rbac', permissions.grants);

  const normalizedRoles = normalizeRoles(roles);
  const normalizedResources = normalizeResources(resources);
  const normalizedMatrixByRole = groupRoleMatrixByRole(
    enrichRoleMatrixWithNames(
      normalizeRoleMatrix(roleMatrix),
      normalizedRoles,
    ),
  );

  const matrixPaginated = paginateList(
    normalizedMatrixByRole,
    tab === 'matrix' ? page : 1,
    limit,
  );
  const hasData = normalizedRoles.length > 0 || normalizedResources.length > 0;

  const resourcesPaginated = paginateList(
    normalizedResources,
    tab === 'resources' ? page : 1,
    limit,
  );

  const listPagination = tab === 'resources'
    ? {
        page: resourcesPaginated.page,
        limit: resourcesPaginated.limit,
        total: resourcesPaginated.total,
        itemLabel: 'module',
      }
    : tab === 'matrix'
      ? {
          page: matrixPaginated.page,
          limit: matrixPaginated.limit,
          total: matrixPaginated.total,
          itemLabel: 'chức vụ',
        }
      : null;

  const querySuffix = buildRbacQuerySuffix({
    tab,
    page: listPagination?.page ?? page,
    limit,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader title="Phân quyền" />

      {fetchError && !hasData ? (
        <AdminErrorState
          message={fetchError}
          hint={(
            <>
              Cần quyền <strong>read:any</strong> trên module <strong>rbac</strong>.
              Liên hệ quản trị viên để được cấp quyền xem và chỉnh sửa phân quyền.
            </>
          )}
        />
      ) : (
        <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-gray-100" />}>
          <DynamicRbacManager
            activeTab={tab}
            roleMatrix={matrixPaginated.items}
            roleMatrixTotal={normalizedMatrixByRole.length}
            roles={normalizedRoles}
            resources={resourcesPaginated.items}
            allResources={normalizedResources}
            resourcesTotal={normalizedResources.length}
            fetchError={fetchError}
            canManage={rbacCaps.canUpdate}
            pagination={listPagination}
            querySuffix={querySuffix}
          />
        </Suspense>
      )}
    </div>
  );
}
