import { notFound } from 'next/navigation';
import { getStaffById, getStaffAccessLogs } from '@/lib/api/staff';
import { getRoleDocuments } from '@/lib/api/rbac';
import { normalizeRoles } from '@/lib/rbac/rbacNormalize';
import StaffDetailView from '@/components/staff/StaffDetailView';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';

export const dynamic = 'force-dynamic';

function pickStaffRoles(roles) {
  return (roles ?? []).filter(
    (role) =>
      (role.role_type === 'STAFF' || role.role_type === 'ADMIN') &&
      role.role_status !== 'block',
  );
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const staff = await getStaffById(id);
    if (staff?.user_name) return { title: staff.user_name };
  } catch { /* fallback */ }
  return { title: 'Chi tiết nhân viên' };
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function StaffDetailPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const staffCaps = getResourceCapabilities('staff', permissions.grants);

  let staff = null;
  let accessLogs = { items: [], total: 0 };
  let staffRoles = [];

  try {
    [staff, accessLogs] = await Promise.all([
      getStaffById(id),
      getStaffAccessLogs(id, { limit: 20 }),
    ]);
  } catch {
    notFound();
  }

  if (!staff?.user_id) notFound();

  if (staffCaps.canUpdate) {
    try {
      const raw = await getRoleDocuments();
      staffRoles = pickStaffRoles(normalizeRoles(raw));
    } catch {
      staffRoles = [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <StaffDetailView
        staff={staff}
        accessLogs={accessLogs}
        canUpdate={staffCaps.canUpdate}
        staffRoles={staffRoles}
      />
    </div>
  );
}
