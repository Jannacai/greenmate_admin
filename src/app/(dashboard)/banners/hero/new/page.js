import { redirect } from 'next/navigation';
import DynamicBannerForm from '@/components/banners/DynamicBannerForm';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader } from '@/components/admin';

export const metadata = {
  title: 'Tạo slide hero',
};

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function HeroBannerNewPage({ searchParams }) {
  const params = await searchParams;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('banner', permissions.grants);

  if (!caps.canCreate) {
    redirect('/banners');
  }

  const defaultPlacement = params.placement ?? 'home_hero';

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <PageBackHeader
        backHref="/banners"
        backLabel="Quay lại danh sách banner"
        title="Tạo slide hero"
        description="Hero slider đầu trang — trang chủ, hạt dinh dưỡng hoặc sữa hạt organic."
      />

      <DynamicBannerForm
        variant="hero"
        mode="create"
        canSubmit
        cancelHref="/banners"
        defaultPlacement={defaultPlacement}
      />
    </div>
  );
}
