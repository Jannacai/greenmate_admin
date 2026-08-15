import { redirect } from 'next/navigation';
import DynamicBannerForm from '@/components/banners/DynamicBannerForm';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader } from '@/components/admin';

export const metadata = {
  title: 'Tạo banner danh mục',
};

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function CategoryBannerNewPage({ searchParams }) {
  await searchParams;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('banner', permissions.grants);

  if (!caps.canCreate) {
    redirect('/banners');
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <PageBackHeader
        backHref="/banners"
        backLabel="Quay lại danh sách banner"
        title="Tạo banner danh mục"
        description="Strip CTA gắn danh mục cấp 1 hoặc cấp 2 — mỗi danh mục chỉ một banner."
      />

      <DynamicBannerForm
        variant="category"
        mode="create"
        canSubmit
        cancelHref="/banners"
      />
    </div>
  );
}
