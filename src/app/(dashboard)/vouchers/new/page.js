import { redirect } from 'next/navigation';
import DynamicVoucherForm from '@/components/vouchers/DynamicVoucherForm';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader } from '@/components/admin';

export const metadata = {
  title: 'Tạo voucher',
  robots: { index: false },
};

export default async function VoucherNewPage() {
  const permissions = await getCachedMyPermissions();
  const discountCaps = getResourceCapabilities('discount', permissions.grants);

  if (!discountCaps.canCreate) {
    redirect('/vouchers');
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <PageBackHeader
        backHref="/vouchers"
        backLabel="Quay lại danh sách voucher"
        title="Tạo voucher"
      />

      <DynamicVoucherForm mode="create" canSubmit cancelHref="/vouchers" />
    </div>
  );
}
