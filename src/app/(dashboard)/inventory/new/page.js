import IngredientStockForm from '@/components/inventory/IngredientStockForm';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader } from '@/components/admin';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Nhập kho nguyên liệu',
  robots: { index: false },
};

export default async function NewIngredientStockPage() {
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('ingredient', permissions.grants);

  if (!caps.canCreate) {
    redirect('/inventory');
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageBackHeader
        backHref="/inventory"
        backLabel="Quay lại tồn kho"
        title="Nhập kho nguyên liệu"
      />

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <IngredientStockForm redirectToDetail />
      </section>
    </div>
  );
}
