export const dynamic = 'force-dynamic';

import { PageHeader, PageHeaderAction } from '@/components/admin';
import CategoryListTable from '@/components/categories/CategoryListTable';
import { getCategories, getCategoryStats } from '@/lib/api/category';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';

export default async function CategoriesPage() {
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('category', permissions.grants);

  const [{ items }, stats] = await Promise.all([
    getCategories({ level: 2, limit: 100, sort: 'sort_asc' }),
    getCategoryStats(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader
        title="Loại sản phẩm"
        description="Danh mục con hiển thị trên menu (Hạt điều, Óc chó…). Nhóm lớn Hạt/Sữa do hệ thống quản lý."
        action={
          caps.canCreate ? (
            <PageHeaderAction href="/categories/new">Thêm loại sản phẩm</PageHeaderAction>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Loại sản phẩm" value={stats.level2 ?? items.length} />
        <StatCard label="Đang hiển thị" value={stats.active ?? 0} />
        <StatCard label="Nhóm lớn (hệ thống)" value={stats.level1 ?? 0} />
      </div>

      <CategoryListTable
        categories={items}
        canCreate={caps.canCreate}
        canUpdate={caps.canUpdate}
        canDelete={caps.canDelete}
      />
    </div>
  );
}

/** @param {{ label: string, value: number }} props */
function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-brand-dark">{value}</p>
    </div>
  );
}
