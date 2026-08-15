import { notFound } from 'next/navigation';
import { getIngredientById } from '@/lib/api/ingredient';
import IngredientRowActions from '@/components/inventory/IngredientRowActions';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import {
  formatIngredientName,
  formatIngredientQuantity,
  getIngredientListMeta,
} from '@/lib/ingredients/ingredientDisplay';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader } from '@/components/admin';
import { formatCurrency, formatDate, cn } from '@/lib/shared/utils';

export const dynamic = 'force-dynamic';

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const item = await getIngredientById(id);
    if (item?.ingredient_name) {
      return { title: `Chi tiết · ${formatIngredientName(item.ingredient_name)}` };
    }
  } catch { /* fallback */ }
  return { title: 'Chi tiết nguyên liệu' };
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function IngredientDetailPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('ingredient', permissions.grants);

  let ingredient = null;
  try {
    ingredient = await getIngredientById(id);
  } catch {
    notFound();
  }

  if (!ingredient?._id) notFound();

  const meta = getIngredientListMeta(ingredient);
  const history = Array.isArray(ingredient.ingredient_history)
    ? [...ingredient.ingredient_history].reverse()
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageBackHeader
        backHref="/inventory"
        backLabel="Quay lại tồn kho"
        title={meta.name}
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
        action={(
          <IngredientRowActions
            ingredientId={meta.id}
            name={meta.name}
            canUpdate={caps.canUpdate}
            canDelete={caps.canDelete}
          />
        )}
      />

      <ProductIdCopy id={meta.id} size="md" label="Mã nguyên liệu" className="max-w-md" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tồn kho" value={meta.stockLabel} emphasize />
        <StatCard label="Giá vốn / đv" value={meta.costLabel} />
        <StatCard label="Vị trí" value={meta.location} />
        <StatCard
          label="Cập nhật"
          value={meta.updatedAt ? formatDate(meta.updatedAt, 'datetime') : '—'}
        />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 md:px-6">
          <h2 className="text-sm font-semibold text-brand-dark">Lịch sử nhập kho</h2>
          <p className="text-xs text-gray-400">{history.length} lần nhập gần nhất</p>
        </div>
        {history.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400 md:px-6">Chưa có lịch sử nhập.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="bg-brand-gray text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-2.5 md:px-6">Ngày</th>
                  <th className="px-4 py-2.5">Số lượng</th>
                  <th className="px-4 py-2.5">Giá trị lô</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((row, idx) => (
                  <tr key={idx} className="text-gray-600">
                    <td className="px-4 py-2.5 md:px-6 text-xs whitespace-nowrap">
                      {row.import_date ? formatDate(row.import_date, 'datetime') : '—'}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {formatIngredientQuantity(row.import_quantity ?? 0, meta.unit)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                      {formatCurrency(row.import_price ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/** @param {{ label: string, value: string, emphasize?: boolean }} props */
function StatCard({ label, value, emphasize = false }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 md:text-xs">{label}</p>
      <p
        className={cn(
          'mt-1 text-sm md:text-base truncate',
          emphasize ? 'font-bold text-brand-dark' : 'font-medium text-gray-700',
        )}
      >
        {value}
      </p>
    </div>
  );
}
