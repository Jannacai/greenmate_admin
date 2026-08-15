import Link from 'next/link';
import { AdminButtonOutline } from '@/components/admin';

/**
 * Hiển thị khi không tải được quyền RBAC — không fail-open im lặng.
 *
 * @param {{ message?: string }} props
 */
export default function PermissionsLoadError({ message }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="rounded-full bg-amber-50 p-3">
        <svg
          className="h-8 w-8 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h1 className="text-lg font-bold text-brand-dark">Không tải được quyền truy cập</h1>
      <p className="text-sm text-gray-600">
        {message ?? 'Hệ thống phân quyền tạm thời không phản hồi. Vui lòng thử lại hoặc đăng nhập lại.'}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/dashboard">
          <AdminButtonOutline size="sm">Thử tải lại</AdminButtonOutline>
        </Link>
        <Link href="/login">
          <AdminButtonOutline size="sm">Đăng nhập lại</AdminButtonOutline>
        </Link>
      </div>
    </div>
  );
}
