import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/api/order';
import OrderDetailView from '@/components/orders/OrderDetailView';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';

export const dynamic = 'force-dynamic';

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const order = await getOrderById(id);
    if (order?.order_trackingNumber) {
      return { title: order.order_trackingNumber };
    }
  } catch { /* fallback */ }
  return { title: 'Chi tiết đơn hàng' };
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('order', permissions.grants);

  let order = null;

  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }

  if (!order?._id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <OrderDetailView order={order} canUpdate={caps.canUpdate} />
    </div>
  );
}
