'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { showToastFromQuery, stripToastParams } from '@/lib/shared/toast';

/**
 * Đọc ?toast= / ?forbidden= sau redirect server action → hiện Sonner → xóa query.
 */
export default function UrlToastListener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handledRef = useRef('');

  useEffect(() => {
    const toastKey = searchParams.get('toast');
    const forbidden = searchParams.get('forbidden');

    if (!toastKey && forbidden !== '1') return;

    const signature = `${pathname}|${toastKey ?? ''}|${forbidden ?? ''}`;
    if (handledRef.current === signature) return;
    handledRef.current = signature;

    if (forbidden === '1') {
      showToastFromQuery('forbidden');
    }
    if (toastKey) {
      showToastFromQuery(toastKey);
    }

    router.replace(stripToastParams(pathname, searchParams), { scroll: false });
  }, [pathname, searchParams, router]);

  return null;
}
