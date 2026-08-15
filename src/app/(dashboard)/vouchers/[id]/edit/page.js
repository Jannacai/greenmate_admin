import { cache } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getDiscountById } from '@/lib/api/discount';
import DynamicVoucherForm from '@/components/vouchers/DynamicVoucherForm';
import VoucherStatusBadge from '@/components/vouchers/VoucherStatusBadge';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { normalizeVoucherForProductForm } from '@/lib/vouchers/voucherFormInitial';
import { PageBackHeader, AdminButtonOutline } from '@/components/admin';

export const dynamic = 'force-dynamic';

const getDiscountCached = cache(getDiscountById);

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const discount = await getDiscountCached(id);
    if (discount?.discount_code) {
      return { title: `Sửa · ${discount.discount_code}` };
    }
  } catch { /* fallback */ }
  return { title: 'Sửa voucher' };
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function VoucherEditPage({ params }) {
  const { id } = await params;

  const permissions = await getCachedMyPermissions();
  const discountCaps = getResourceCapabilities('discount', permissions.grants);

  if (!discountCaps.canUpdate) {
    redirect(`/vouchers/${id}`);
  }

  let discount = null;

  try {
    discount = await getDiscountCached(id);
  } catch {
    notFound();
  }

  if (!discount?._id) {
    notFound();
  }

  const formInitial = await normalizeVoucherForProductForm(discount);

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <PageBackHeader
        backHref={`/vouchers/${id}`}
        backLabel="Quay lại chi tiết"
        title={discount.discount_code || 'Sửa voucher'}
        titleClassName="font-mono uppercase tracking-wider text-orange-600"
        description="Sửa voucher"
        badge={<VoucherStatusBadge discount={discount} dense />}
        action={(
          <Link href={`/vouchers/${id}`} className="inline-flex shrink-0">
            <AdminButtonOutline type="button">Xem chi tiết</AdminButtonOutline>
          </Link>
        )}
        className="mb-5"
      />

      <DynamicVoucherForm
        mode="edit"
        discountId={discount._id}
        initial={formInitial}
        canSubmit
        cancelHref={`/vouchers/${id}`}
      />
    </div>
  );
}
