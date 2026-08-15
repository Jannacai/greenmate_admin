import ProductPreviewWorkspace from '@/components/products/preview/ProductPreviewWorkspace';
import ProductPreviewDescription from '@/components/products/preview/ProductPreviewDescription';
import { listFilledProductInfoSections } from '@/lib/products/productInfoAttributes';
import ProductPreviewSummaryBar from '@/components/products/preview/ProductPreviewSummaryBar';
import { normalizeProductForPreview } from '@/lib/products/productPreview';
import { pickProductCodeFromApi, pickAppliedVoucherCodeFromApi, pickAppliedVoucherIdFromApi } from '@/lib/products/productDisplay';
import { PRODUCT_TYPE_LABELS } from '@/lib/products/productListFilter';

const BADGE_LABELS = {
  hot: 'Bán chạy',
  new: 'Mới',
  sale: 'Giảm giá',
};

/**
 * @param {{ product: object, status?: 'published' | 'draft' }} props
 */
export default function ProductPreviewView({ product, status = 'draft' }) {
  const previewProduct = normalizeProductForPreview(product);
  const displayCode = pickProductCodeFromApi(previewProduct);
  const attrs = previewProduct.product_attributes ?? {};
  const typeLabel = PRODUCT_TYPE_LABELS[previewProduct.product_type] ?? previewProduct.product_type;
  const badge = previewProduct.product_badge;
  const badgeLabel =
    badge?.badge_type && badge.badge_type !== 'none'
      ? badge.text || BADGE_LABELS[badge.badge_type] || badge.badge_type
      : null;

  const soldCount = Number(previewProduct.product_quantity_sold ?? 0);
  const appliedVoucherCode = pickAppliedVoucherCodeFromApi(previewProduct);
  const appliedVoucherId = pickAppliedVoucherIdFromApi(previewProduct);
  const discountLabel =
    previewProduct.has_discount && previewProduct.product_discount_percentage > 0
      ? `-${previewProduct.product_discount_percentage}%`
      : null;

  const infoSections = listFilledProductInfoSections(attrs).filter(
    (section) => section.key !== 'brand' && section.key !== 'origin',
  );

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <ProductPreviewSummaryBar
        status={status}
        typeLabel={typeLabel}
        soldCount={soldCount}
        productCode={displayCode}
        productName={previewProduct.product_name}
        brand={attrs.brand}
        origin={attrs.origin}
        appliedVoucherCode={appliedVoucherCode}
        appliedVoucherId={appliedVoucherId}
        badgeLabel={badgeLabel}
        badgeType={badge?.badge_type}
        discountLabel={discountLabel}
      />

      <ProductPreviewWorkspace product={previewProduct} />

      <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <h2 className="mb-3 text-sm font-semibold text-brand-dark">Mô tả sản phẩm</h2>
        <ProductPreviewDescription text={previewProduct.product_descriptions} layout="block" />
      </section>

      {infoSections.length > 0 && (
        <section className="min-w-0 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold text-brand-dark">Thông tin chi tiết</h2>
          {infoSections.map((section) => (
            <div key={section.key} className="min-w-0 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {section.label}
              </h3>
              <ProductPreviewDescription text={section.value} layout="block" />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
