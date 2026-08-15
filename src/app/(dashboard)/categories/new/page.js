import DynamicCategoryForm from '@/components/categories/DynamicCategoryForm';
import { PageHeader } from '@/components/admin';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';

export default async function NewCategoryPage() {
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('category', permissions.grants);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Thêm loại sản phẩm"
        description="Tạo danh mục con như Hạt điều, Óc chó — hiển thị trên menu và trang danh mục storefront."
      />
      <DynamicCategoryForm mode="create" canSubmit={caps.canCreate} />
    </div>
  );
}
