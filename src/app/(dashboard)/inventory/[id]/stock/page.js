import { notFound, redirect } from 'next/navigation';
import { getIngredientById } from '@/lib/api/ingredient';
import IngredientStockForm from '@/components/inventory/IngredientStockForm';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import { formatIngredientName, getIngredientListMeta } from '@/lib/ingredients/ingredientDisplay';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader } from '@/components/admin';
import { cn } from '@/lib/shared/utils';

export const dynamic = 'force-dynamic';

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const item = await getIngredientById(id);
    if (item?.ingredient_name) {
      return { title: `Nhập thêm · ${formatIngredientName(item.ingredient_name)}` };
    }
  } catch { /* fallback */ }
  return { title: 'Nhập thêm kho' };
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function IngredientStockPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('ingredient', permissions.grants);

  if (!caps.canUpdate) {
    redirect('/inventory');
  }

  let ingredient = null;
  try {
    ingredient = await getIngredientById(id);
  } catch {
    notFound();
  }

  if (!ingredient?._id) notFound();

  const meta = getIngredientListMeta(ingredient);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageBackHeader
        backHref={`/inventory/${meta.id}`}
        backLabel="Quay lại chi tiết"
        title="Nhập thêm kho"
        badge={(
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
              meta.stockStatus.className,
            )}
          >
            {meta.stockStatus.label}
          </span>
        )}
      />

      <ProductIdCopy id={meta.id} size="md" label="Mã nguyên liệu" className="max-w-md" />

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-sm font-semibold text-brand-dark">{meta.name}</h2>
        <p className="mt-1 text-xs text-gray-400">
          Tồn hiện tại: <span className="font-semibold text-brand-dark">{meta.stockLabel}</span>
          {' · '}
          Cộng dồn vào kho — cập nhật giá vốn và vị trí mới nhất.
        </p>
        <div className="mt-4">
          <IngredientStockForm
            defaultName={meta.name}
            defaultUnit={meta.unit}
            defaultLocation={ingredient.ingredient_location ?? 'Kho chính'}
            lockName
            redirectToDetail
          />
        </div>
      </section>
    </div>
  );
}
