import DynamicProductForm from '@/components/products/form/DynamicProductForm';
import { getEligibleProductVouchers } from '@/lib/products/productVoucherPicker.server';

/**
 * @param {{ shopId: string }} props
 */
export default async function ProductCreateForm({ shopId }) {
  const eligibleVouchers = shopId ? await getEligibleProductVouchers() : [];

  return (
    <DynamicProductForm
      shopId={shopId}
      mode="create"
      eligibleVouchers={eligibleVouchers}
    />
  );
}
