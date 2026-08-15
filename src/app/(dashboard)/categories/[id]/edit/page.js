import { notFound } from 'next/navigation';
import DynamicCategoryForm from '@/components/categories/DynamicCategoryForm';
import { AdminErrorState, PageHeader } from '@/components/admin';
import { getCategoryById } from '@/lib/api/category';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('category', permissions.grants);

  let category = null;
  try {
    category = await getCategoryById(id);
  } catch {
    notFound();
  }

  if (category.category_level === 1) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <PageHeader title="Danh mục hệ thống" />
        <AdminErrorState
          message="Đây là nhóm sản phẩm cấp 1 (Hạt dinh dưỡng / Sữa hạt) — do hệ thống quản lý."
          hint="Chỉ chỉnh sửa các loại sản phẩm cấp 2 (Hạt điều, Óc chó…) trong danh sách."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title={`Sửa: ${category.category_name}`} />
      <DynamicCategoryForm
        mode="edit"
        categoryId={id}
        initial={category}
        canSubmit={caps.canUpdate}
      />
    </div>
  );
}
