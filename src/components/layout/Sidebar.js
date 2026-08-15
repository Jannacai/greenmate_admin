'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavIcon } from '@/components/layout/NavIcons';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   navGroups: import('@/lib/rbac/navConfig').NavGroup[],
 * }} props
 */
export default function Sidebar({ isOpen, onClose, navGroups }) {
  const pathname = usePathname();

  const isActive = (href) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:w-[232px] lg:flex-shrink-0 lg:flex-col',
        'fixed inset-y-0 left-0 z-30 w-[260px] flex-col',
        'lg:static lg:z-auto lg:translate-x-0',
        isOpen ? 'flex translate-x-0' : '-translate-x-full lg:translate-x-0',
        'transition-transform duration-300 ease-in-out',
        'border-r border-gray-200 bg-white',
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-gray-200 px-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-accent">
          <span className="text-xs font-bold text-brand-primary">G</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight text-brand-dark">GreenMate</p>
          <p className="truncate text-[10px] leading-tight text-gray-400">Admin</p>
        </div>

        <button
          aria-label="Đóng menu"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-brand-gray hover:text-brand-dark lg:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={cn(groupIndex > 0 && 'mt-3')}>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                        active
                          ? 'bg-brand-primary/10 font-semibold text-brand-dark ring-1 ring-inset ring-brand-primary/20'
                          : 'text-brand-dark hover:bg-brand-gray',
                      )}
                    >
                      <NavIcon
                        name={item.icon}
                        className={cn(
                          'h-4 w-4 shrink-0',
                          active ? 'text-brand-primary' : 'text-gray-500',
                        )}
                      />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
