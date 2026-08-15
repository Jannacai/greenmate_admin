import { notFound } from 'next/navigation';
import { getCustomerById, getCustomerAccessLogs } from '@/lib/api/customer';
import CustomerDetailView from '@/components/customers/CustomerDetailView';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';

export const dynamic = 'force-dynamic';

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const customer = await getCustomerById(id);
    if (customer?.user_name) {
      return { title: customer.user_name };
    }
  } catch { /* fallback */ }
  return { title: 'Chi tiết khách hàng' };
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const customerCaps = getResourceCapabilities('customer', permissions.grants);

  let customer = null;
  let accessLogs = { items: [], total: 0 };

  try {
    [customer, accessLogs] = await Promise.all([
      getCustomerById(id),
      getCustomerAccessLogs(id, { limit: 20 }),
    ]);
  } catch {
    notFound();
  }

  if (!customer?.user_id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <CustomerDetailView
        customer={customer}
        accessLogs={accessLogs}
        canUpdate={customerCaps.canUpdate}
      />
    </div>
  );
}
