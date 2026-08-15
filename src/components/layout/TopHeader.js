'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import { cn } from '@/lib/shared/utils';

/** Map path → breadcrumb label */
const BREADCRUMB_MAP = {
  '/dashboard':     'Tổng quan',
  '/products':      'Sản phẩm',
  '/products/new':  'Thêm sản phẩm',
  '/orders':        'Đơn hàng',
  '/customers':     'Khách hàng',
  '/staff':         'Nhân viên',
  '/staff/new':     'Thêm nhân viên',
  '/collections': 'Bộ sưu tập',
  '/banners': 'Banner Hero',
  '/vouchers':      'Voucher',
  '/inventory':     'Tồn kho',
  '/inventory/new': 'Nhập kho',
  '/reviews':       'Đánh giá',
  '/notifications': 'Thông báo',
  '/settings':      'Cài đặt',
};

/**
 * @param {{
 *   onMenuClick: () => void,
 *   user: { name: string, email: string },
 * }} props
 */
export default function TopHeader({ onMenuClick, user }) {
  const pathname     = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, startTransition]    = useTransition();
  const dropdownRef  = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Breadcrumb từ pathname
  const segments   = pathname.split('/').filter(Boolean);
  const rootPath   = '/' + (segments[0] ?? 'dashboard');
  const fullPath   = '/' + segments.join('/');
  const rootLabel  = BREADCRUMB_MAP[rootPath] ?? segments[0] ?? 'Dashboard';
  const subLabel   = segments.length > 1 ? (BREADCRUMB_MAP[fullPath] ?? segments.slice(1).join(' / ')) : null;
  const hasSubPage = segments.length > 1;

  function handleLogout() {
    setDropdownOpen(false);
    startTransition(() => logoutAction());
  }

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">

      {/* Hamburger — mobile only */}
      <button
        aria-label="Mở menu"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {rootPath !== '/dashboard' && (
          <>
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link
              href={rootPath}
              className={cn(
                'truncate transition-colors',
                hasSubPage ? 'text-gray-400 hover:text-gray-600' : 'font-medium text-brand-dark',
              )}
            >
              {rootLabel}
            </Link>
          </>
        )}

        {hasSubPage && (
          <>
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="truncate font-medium text-brand-dark">
              {subLabel}
            </span>
          </>
        )}
      </nav>

      {/* Right actions */}
      <div className="flex flex-shrink-0 items-center gap-2">

        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Thông báo"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Dot badge */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Link>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white text-xs font-bold uppercase">
              {user.name?.charAt(0) ?? 'A'}
            </div>
            <span className="hidden sm:block max-w-[120px] truncate">{user.name}</span>
            <svg
              className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-lg shadow-black/8 z-50">
              {/* User info */}
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-brand-dark">{user.name}</p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cài đặt
                </Link>
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isPending ? 'Đang đăng xuất…' : 'Đăng xuất'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
