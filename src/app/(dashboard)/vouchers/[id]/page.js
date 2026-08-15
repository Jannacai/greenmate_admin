import { notFound } from 'next/navigation';
import { getDiscountById, getDiscountScopeProducts } from '@/lib/api/discount';
import VoucherDetailView from '@/components/vouchers/VoucherDetailView';
import { mapDiscountScopeApiToDisplay } from '@/lib/vouchers/voucherScopeFromApi';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { parseScopeListLimit, parseScopeListPage } from '@/lib/shared/listPagination';
import { PageBackHeader, AdminErrorState } from '@/components/admin';

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const discount = await getDiscountById(id);
    return { title: `Voucher ${discount.discount_code}` };
  } catch {
    return { title: 'Chi tiết voucher' };
  }
}

/**
 * @param {{ params: Promise<{ id: string }>, searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 */
export default async function VoucherDetailPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const scopePage = parseScopeListPage(
    typeof sp?.scopePage === 'string' ? sp.scopePage : undefined,
  );
  const scopeLimit = parseScopeListLimit(
    typeof sp?.scopeLimit === 'string' ? sp.scopeLimit : undefined,
  );
  const scopeSearch = typeof sp?.scopeSearch === 'string' ? sp.scopeSearch.trim() : '';

  const permissions = await getCachedMyPermissions();
  const discountCaps = getResourceCapabilities('discount', permissions.grants);

  let discount = null;
  let scope = null;
  let fetchError = null;

  try {
    const [discountData, scopeApi] = await Promise.all([
      getDiscountById(id),
      getDiscountScopeProducts(id, {
        page: scopePage,
        limit: scopeLimit,
        search: scopeSearch,
      }),
    ]);
    discount = discountData;
    scope = {
      ...mapDiscountScopeApiToDisplay(scopeApi),
      scopeSearch,
    };
  } catch (err) {
    if (err?.message?.includes('404') || err?.message?.includes('Không tìm thấy')) {
      notFound();
    }
    fetchError = err?.message ?? 'Không tải được voucher';
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <PageBackHeader
          backHref="/vouchers"
          backLabel="Quay lại danh sách voucher"
          title="Chi tiết voucher"
        />
        <AdminErrorState message={fetchError} />
      </div>
    );
  }

  if (!discount || !scope) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageBackHeader
        backHref="/vouchers"
        backLabel="Quay lại danh sách voucher"
        title={discount.discount_code || 'Chi tiết voucher'}
        titleClassName="font-mono uppercase tracking-wider text-orange-600"
      />

      <VoucherDetailView
        discount={discount}
        scope={scope}
        canUpdate={discountCaps.canUpdate}
        canDelete={discountCaps.canDelete}
      />
    </div>
  );
}
