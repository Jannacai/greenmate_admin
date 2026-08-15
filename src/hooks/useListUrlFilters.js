'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

/**
 * Pattern chung cho filter bar danh sách admin: draft tìm kiếm + cập nhật URL searchParams.
 * @param {{ searchParam?: string }} [options]
 */
export function useListUrlFilters({ searchParam = 'search' } = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const urlSearch = searchParams.get(searchParam) ?? '';
  const [searchDraft, setSearchDraft] = useState(urlSearch);

  useEffect(() => {
    setSearchDraft(urlSearch);
  }, [urlSearch]);

  const buildHref = useCallback((updates, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    if (resetPage) params.delete('page');

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const replaceParams = useCallback((updates, resetPage = true) => {
    startTransition(() => {
      router.replace(buildHref(updates, resetPage));
    });
  }, [buildHref, router]);

  const applySearch = useCallback((value) => {
    const q = typeof value === 'string' ? value : searchDraft;
    replaceParams({ [searchParam]: String(q ?? '').trim() });
  }, [replaceParams, searchDraft, searchParam]);

  const clearAllFilters = useCallback(() => {
    setSearchDraft('');
    startTransition(() => {
      router.replace(pathname);
    });
  }, [pathname, router]);

  return {
    pathname,
    searchParams,
    router,
    isPending,
    startTransition,
    searchDraft,
    setSearchDraft,
    buildHref,
    replaceParams,
    applySearch,
    clearAllFilters,
  };
}
