'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavIcon } from '@/components/layout/NavIcons';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{
 *   onMoreClick: () => void,
 *   mobileTabs: import('@/lib/rbac/navConfig').NavItem[],
 * }} props
 */
export default function MobileBottomNav({ onMoreClick, mobileTabs }) {
  const pathname = usePathname();

  const isActive = (href) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <nav
      aria-label="Điều hướng mobile"
      className="fixed bottom-0 inset-x-0 z-10 flex h-16 items-center border-t border-gray-200 bg-white lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {mobileTabs.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              active ? 'text-[#6B4E3D]' : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <span className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg transition-colors',
              active && 'bg-[#6B4E3D]/10',
            )}>
              <NavIcon name={tab.icon} className="h-5 w-5" />
            </span>
            {tab.label}
          </Link>
        );
      })}

      <button
        onClick={onMoreClick}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Xem thêm chức năng"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </span>
        Thêm
      </button>
    </nav>
  );
}
