import { getRoleDocuments } from '@/lib/api/rbac';
import { normalizeRoles } from '@/lib/rbac/rbacNormalize';
import StaffSignupForm from '@/components/staff/StaffSignupForm';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader } from '@/components/admin';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Thêm nhân viên',
  robots: { index: false },
};

function pickStaffRoles(roles) {
  return (roles ?? []).filter(
    (role) => role.role_type === 'STAFF' && role.role_status !== 'block',
  );
}

export default async function StaffNewPage() {
  const permissions = await getCachedMyPermissions();
  const staffCaps = getResourceCapabilities('staff', permissions.grants);

  if (!staffCaps.canUpdate) {
    redirect('/staff');
  }

  let staffRoles = [];
  let rolesError = null;

  try {
    const raw = await getRoleDocuments();
    staffRoles = pickStaffRoles(normalizeRoles(raw));
  } catch (err) {
    rolesError = err?.message ?? 'Không tải được danh sách vai trò';
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageBackHeader
        backHref="/staff"
        backLabel="Quay lại danh sách nhân viên"
        title="Thêm nhân viên"
      />

      <StaffSignupForm roles={staffRoles} rolesError={rolesError} />
    </div>
  );
}
