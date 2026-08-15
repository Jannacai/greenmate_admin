'use client';

import { useRouter } from 'next/navigation';
import { AdminButtonGhost } from '@/components/admin/AdminButton';
import { cn } from '@/lib/shared/utils';

function BackIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

/**
 * Nút quay lại — ưu tiên `router.back()`, fallback `fallbackHref` khi không có lịch sử.
 * @param {{ fallbackHref?: string, label?: string, className?: string }} props
 */
export function PageBackButton({
  fallbackHref = '/dashboard',
  label = 'Quay lại trang trước',
  className,
}) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <AdminButtonGhost
      type="button"
      onClick={handleBack}
      title={label}
      aria-label={label}
      className={cn(
        'h-11 w-11 shrink-0 p-0',
        'border-brand-primary text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary',
        className,
      )}
    >
      <BackIcon />
    </AdminButtonGhost>
  );
}
