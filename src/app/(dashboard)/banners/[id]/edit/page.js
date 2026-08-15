import { cache } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getBannerById } from '@/lib/api/banner';
import DynamicBannerForm from '@/components/banners/DynamicBannerForm';
import BannerStatusBadge from '@/components/banners/BannerStatusBadge';
import { getBannerPlacementLabel } from '@/lib/banners/bannerDisplay';
import { BANNER_KIND_LABELS } from '@/lib/banners/bannerSchema';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader, AdminButtonOutline } from '@/components/admin';

export const dynamic = 'force-dynamic';

const getBannerCached = cache(getBannerById);

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const banner = await getBannerCached(id);
    if (banner?.banner_title) {
      return { title: `Sửa · ${banner.banner_title}` };
    }
  } catch {
    /* fallback */
  }
  return { title: 'Sửa banner' };
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function BannerEditPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('banner', permissions.grants);

  if (!caps.canUpdate) {
    redirect(`/banners/${id}`);
  }

  let banner = null;

  try {
    banner = await getBannerCached(id);
  } catch {
    notFound();
  }

  if (!banner?._id) {
    notFound();
  }

  const isCategoryStrip = banner.banner_kind === 'category_strip';
  const variant = isCategoryStrip ? 'category' : 'hero';
  const kindLabel = BANNER_KIND_LABELS[banner.banner_kind] ?? 'Banner';

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <PageBackHeader
        backHref={`/banners/${id}`}
        backLabel="Quay lại chi tiết"
        title={isCategoryStrip ? 'Sửa banner danh mục' : 'Sửa slide hero'}
        badge={<BannerStatusBadge banner={banner} />}
        action={(
          <Link href={`/banners/${id}`} className="inline-flex shrink-0">
            <AdminButtonOutline type="button">Xem chi tiết</AdminButtonOutline>
          </Link>
        )}
      />

      <div className="mb-5 rounded-xl border border-gray-200 bg-brand-gray/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Loại banner</p>
        <p className="mt-1 text-sm font-medium text-brand-dark">{kindLabel}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Vị trí</p>
        <p className="mt-1 text-sm font-medium text-brand-dark">{getBannerPlacementLabel(banner)}</p>
        <p className="mt-2 text-xs text-gray-500">
          Thứ tự: <span className="font-semibold tabular-nums text-brand-dark">{banner.banner_sort_order ?? 0}</span>
        </p>
      </div>

      <DynamicBannerForm
        variant={variant}
        mode="edit"
        bannerId={id}
        initial={banner}
        canSubmit
        cancelHref={`/banners/${id}`}
      />
    </div>
  );
}
