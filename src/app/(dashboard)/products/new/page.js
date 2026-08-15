import { getAdminShopOwnerId } from '@/lib/auth/shopContext';
import ProductCreateForm from '@/components/products/form/ProductCreateForm';
import { PageBackHeader } from '@/components/admin';

export const metadata = {
  title: 'Thêm sản phẩm mới',
  robots: { index: false },
};

export default async function NewProductPage() {
  const shopId = await getAdminShopOwnerId();

  return (
    <div className="mx-auto min-w-0 max-w-6xl overflow-x-hidden">
      <PageBackHeader
        backHref="/products"
        backLabel="Quay lại danh sách sản phẩm"
        title="Thêm sản phẩm"
      />

      <ProductCreateForm shopId={shopId} />
    </div>
  );
}
