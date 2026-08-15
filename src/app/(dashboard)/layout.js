import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import DashboardShell from '@/components/layout/DashboardShell';
import PermissionsLoadErrorView from '@/components/layout/PermissionsLoadError';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { NAV_GROUPS, MOBILE_BOTTOM_TABS } from '@/lib/rbac/navConfig';
import { filterNavGroups, filterMobileTabs } from '@/lib/rbac/permissions';
import { isRouteAllowed } from '@/lib/rbac/routePermissions';

export const metadata = {
  title: { default: 'Dashboard', template: '%s | GreenMate Admin' },
};

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '/dashboard';

  const user = {
    name: cookieStore.get('admin_user_name')?.value ?? 'Admin',
    email: cookieStore.get('admin_user_email')?.value ?? '',
  };

  let permissions;
  try {
    permissions = await getCachedMyPermissions();
  } catch (err) {
    if (isRedirectError(err)) throw err;

    return (
      <DashboardShell user={user} navGroups={[]} mobileTabs={[]}>
        <PermissionsLoadErrorView message="Không tải được quyền truy cập" />
      </DashboardShell>
    );
  }

  const navGroups = filterNavGroups(NAV_GROUPS, permissions.grants);
  const mobileTabs = filterMobileTabs(MOBILE_BOTTOM_TABS, permissions.grants);

  if (!isRouteAllowed(pathname, permissions.grants)) {
    redirect('/dashboard?forbidden=1');
  }

  return (
    <DashboardShell
      user={user}
      navGroups={navGroups}
      mobileTabs={mobileTabs}
    >
      {children}
    </DashboardShell>
  );
}
