import { redirect } from 'next/navigation';
import DynamicCollectionForm from '@/components/collections/DynamicCollectionForm';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader } from '@/components/admin';

export const metadata = {
  title: 'Tạo bộ sưu tập',
};

export default async function CollectionNewPage() {
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('collection', permissions.grants);

  if (!caps.canCreate) {
    redirect('/collections');
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <PageBackHeader
        backHref="/collections"
        backLabel="Quay lại danh sách bộ sưu tập"
        title="Tạo bộ sưu tập"
      />

      <DynamicCollectionForm mode="create" canSubmit cancelHref="/collections" />
    </div>
  );
}
