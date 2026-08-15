import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getBanners, getBannerStats } from '@/lib/api/banner';
import BannerFilterBar from '@/components/banners/BannerFilterBar';
import BannerListTable from '@/components/banners/BannerListTable';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { parseListLimit, parseListPage, DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';
import { PageHeader, PageHeaderAction, AdminErrorState, AdminPlusIcon, AdminButtonOutline } from '@/components/admin';

export const metadata = {
  title: 'Banner',
};

export const dynamic = 'force-dynamic';

const VALID_KINDS = new Set(['hero_slider', 'category_strip']);

function buildFilterQuery(params) {
  const qs = new URLSearchParams();
  const kind = VALID_KINDS.has(params.kind) ? params.kind : 'hero_slider';
  qs.set('kind', kind);
  for (const key of ['page', 'limit']) {
    if (params[key]) qs.set(key, params[key]);
  }
  return qs.toString();
}

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function BannersPage({ searchParams }) {
  const params = await searchParams;

  if (!params.kind || !VALID_KINDS.has(params.kind)) {
    redirect('/banners?kind=hero_slider');
  }

  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('banner', permissions.grants);
  const page = parseListPage(params.page);
  const limit = parseListLimit(params.limit);
  const kind = params.kind;

  let data = { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };
  let kindStats = { hero_slider: 0, category_strip: 0 };
  let fetchError = null;

  try {
    const [listData, heroStats, categoryStats] = await Promise.all([
      getBanners({
        page,
        limit,
        kind,
        sort: 'sort_asc',
      }),
      getBannerStats({ kind: 'hero_slider' }),
      getBannerStats({ kind: 'category_strip' }),
    ]);
    data = listData;
    kindStats = {
      hero_slider: heroStats?.all ?? 0,
      category_strip: categoryStats?.all ?? 0,
    };
  } catch (err) {
    fetchError = err?.message ?? 'Không tải được danh sách banner';
  }

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader
        title="Banner"
        description="Hero slider đầu trang và banner strip danh mục."
        action={
          caps.canCreate ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <PageHeaderAction href="/banners/hero/new" icon={AdminPlusIcon}>
                Thêm slide hero
              </PageHeaderAction>
              <Link href="/banners/category/new" className="inline-flex shrink-0">
                <AdminButtonOutline type="button" className="min-h-[44px] gap-2 px-4">
                  {AdminPlusIcon}
                  Thêm banner danh mục
                </AdminButtonOutline>
              </Link>
            </div>
          ) : null
        }
      />

      <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-gray-100" />}>
        <BannerFilterBar kindStats={kindStats} />
      </Suspense>

      {fetchError ? (
        <AdminErrorState
          message={fetchError}
          hint={<>Kiểm tra quyền module <strong>banner</strong> (read:any) và server tipjs đang chạy.</>}
        />
      ) : (
        <BannerListTable
          banners={data.items}
          total={data.total}
          page={data.page}
          limit={data.limit}
          canCreate={caps.canCreate}
          canUpdate={caps.canUpdate}
          canDelete={caps.canDelete}
          querySuffix={buildFilterQuery(params)}
        />
      )}
    </div>
  );
}
