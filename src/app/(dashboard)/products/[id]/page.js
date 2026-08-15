import { cache } from 'react';
import { notFound } from 'next/navigation';
import { PageBackButton } from '@/components/admin';
import { getProductById } from '@/lib/api/product';
import DynamicProductPreviewView from '@/components/products/preview/DynamicProductPreviewView';
import ProductPreviewActions from '@/components/products/preview/ProductPreviewActions';
import ProductStatusBadge from '@/components/products/shared/ProductStatusBadge';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';

export const dynamic = 'force-dynamic';

const getProductCached = cache(getProductById);

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const product = await getProductCached(id);
    if (product?.product_name) {
      return { title: `Chi tiết · ${product.product_name}` };
    }
  } catch { /* fallback */ }
  return { title: 'Chi tiết sản phẩm' };
}

/**
 * @param {{ params: Promise<{ id: string }>, searchParams: Promise<{ status?: string }> }} props
 */
export default async function ProductDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { status: statusParam } = await searchParams;
  const status = statusParam === 'published' ? 'published' : 'draft';

  let product = null;
  try {
    product = await getProductCached(id);
  } catch {
    notFound();
  }

  if (!product || !product._id) {
    notFound();
  }

  const permissions = await getCachedMyPermissions();
  const productCaps = getResourceCapabilities('product', permissions.grants);

  return (
    <div className="mx-auto min-w-0 max-w-7xl overflow-x-hidden">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <PageBackButton fallbackHref="/products" label="Quay lại trang trước" />

          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-2xl font-bold leading-none text-brand-dark">Chi tiết sản phẩm</h1>
            <ProductStatusBadge status={status} />
          </div>
        </div>

        <ProductPreviewActions
          productId={id}
          productName={product.product_name}
          status={status}
          canUpdate={productCaps.canUpdate}
          canDelete={productCaps.canDelete}
          placement="header"
        />
      </div>

      <DynamicProductPreviewView product={product} status={status} />
    </div>
  );
}
