import { notFound } from 'next/navigation';
import { getBannerById } from '@/lib/api/banner';
import BannerDetailView from '@/components/banners/BannerDetailView';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader, AdminErrorState } from '@/components/admin';

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const banner = await getBannerById(id);
    return { title: banner.banner_title || 'Chi tiết slide banner' };
  } catch {
    return { title: 'Chi tiết slide banner' };
  }
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function BannerDetailPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('banner', permissions.grants);

  let banner = null;
  let fetchError = null;

  try {
    banner = await getBannerById(id);
  } catch (err) {
    if (err?.message?.includes('404') || err?.message?.includes('Không tìm thấy')) {
      notFound();
    }
    fetchError = err?.message ?? 'Không tải được slide banner';
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <PageBackHeader backHref="/banners" backLabel="Quay lại danh sách" title="Chi tiết slide" />
        <AdminErrorState message={fetchError} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageBackHeader
        backHref="/banners"
        backLabel="Quay lại danh sách"
        title={banner.banner_title || 'Chi tiết slide banner'}
      />
      <BannerDetailView
        banner={banner}
        canUpdate={caps.canUpdate}
        canDelete={caps.canDelete}
      />
    </div>
  );
}
