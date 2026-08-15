import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminShopOwnerId } from '@/lib/auth/shopContext';
import { AdminButtonOutline, PageBackHeader } from '@/components/admin';
import { getProductById } from '@/lib/api/product';
import { getEligibleProductVouchers } from '@/lib/products/productVoucherPicker.server';
import DynamicProductForm from '@/components/products/form/DynamicProductForm';
import ProductHeaderCodeMeta from '@/components/products/shared/ProductHeaderCodeMeta';
import ProductStatusBadge from '@/components/products/shared/ProductStatusBadge';
import { pickProductCodeFromApi } from '@/lib/products/productDisplay';

export const dynamic = 'force-dynamic';

const getProductCached = cache(getProductById);

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const product = await getProductCached(id);
    if (product?.product_name) {
      return { title: `Sửa · ${product.product_name}` };
    }
  } catch { /* fallback */ }
  return { title: 'Sửa sản phẩm' };
}

/**
 * @param {{ params: Promise<{ id: string }>, searchParams: Promise<{ status?: string }> }} props
 */
export default async function EditProductPage({ params, searchParams }) {
  const { id } = await params;
  const { status: statusParam } = await searchParams;
  const status = statusParam === 'published' ? 'published' : 'draft';

  const shopId = await getAdminShopOwnerId();

  let product = null;
  let eligibleVouchers = [];

  try {
    [product, eligibleVouchers] = await Promise.all([
      getProductCached(id),
      shopId ? getEligibleProductVouchers() : Promise.resolve([]),
    ]);
  } catch {
    notFound();
  }

  if (!product?._id) {
    notFound();
  }

  const productCode = pickProductCodeFromApi(product);

  return (
    <div className="mx-auto min-w-0 max-w-6xl overflow-x-hidden">
      <PageBackHeader
        backHref="/products"
        backLabel="Quay lại danh sách sản phẩm"
        title="Sửa sản phẩm"
        titleMeta={<ProductHeaderCodeMeta code={productCode} />}
        badge={<ProductStatusBadge status={status} />}
        action={(
          <Link href={`/products/${id}?status=${status}`} className="inline-flex shrink-0">
            <AdminButtonOutline
              size="sm"
              className="h-8 min-h-8 gap-1 px-2.5 text-[13px] font-medium"
            >
              Chi tiết sản phẩm
              <svg
                className="h-3 w-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </AdminButtonOutline>
          </Link>
        )}
      />

      <DynamicProductForm
        shopId={shopId}
        mode="edit"
        product={product}
        productId={id}
        status={status}
        eligibleVouchers={eligibleVouchers}
      />
    </div>
  );
}
