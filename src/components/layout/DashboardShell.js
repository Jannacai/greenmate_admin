'use client';

import { Suspense, useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MobileBottomNav from './MobileBottomNav';
import AppToaster from '@/components/common/AppToaster';
import UrlToastListener from '@/components/common/UrlToastListener';

/**
 * @param {{
 *   user: { name: string, email: string },
 *   navGroups: import('@/lib/rbac/navConfig').NavGroup[],
 *   mobileTabs: import('@/lib/rbac/navConfig').NavItem[],
 *   children: React.ReactNode,
 * }} props
 */
export default function DashboardShell({
  children,
  user,
  navGroups,
  mobileTabs,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      <AppToaster />
      <Suspense fallback={null}>
        <UrlToastListener />
      </Suspense>
      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navGroups={navGroups}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopHeader
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        <main className="flex-1 overflow-y-auto p-3 pb-20 lg:p-5 lg:pb-5">
          {children}
        </main>
      </div>

      <MobileBottomNav
        onMoreClick={() => setSidebarOpen(true)}
        mobileTabs={mobileTabs}
      />
    </div>
  );
}
