import Link from 'next/link';
import CollectionStatusBadge from '@/components/collections/CollectionStatusBadge';
import CollectionRowActions from '@/components/collections/CollectionRowActions';
import OptimizedImage from '@/components/common/OptimizedImage';
import { getCollectionProductCount, getCollectionStorefrontPath } from '@/lib/collections/collectionDisplay';
import { pickProductCodeFromApi } from '@/lib/products/productDisplay';
import { getProductPriceDisplay } from '@/lib/vouchers/voucherProductPicker';

/**
 * @param {{
 *   collection: object,
 *   products?: object[],
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 * }} props
 */
export default function CollectionDetailView({
  collection,
  products = [],
  canUpdate = false,
  canDelete = false,
}) {
  const id = String(collection._id);
  const productCount = getCollectionProductCount(collection);
  const storefrontPath = collection.storefront_path ?? getCollectionStorefrontPath(collection);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-brand-dark">{collection.collection_name}</h2>
              <CollectionStatusBadge collection={collection} />
            </div>
            <p className="mt-1 font-mono text-sm text-gray-500">{collection.collection_slug}</p>
            {collection.collection_description ? (
              <p className="mt-3 text-sm text-gray-600">{collection.collection_description}</p>
            ) : null}
          </div>
          <CollectionRowActions
            collectionId={id}
            collection={collection}
            canUpdate={canUpdate}
            canDelete={canDelete}
            hideDetailLink
          />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sản phẩm</dt>
            <dd className="mt-1 text-sm font-bold text-brand-dark">{productCount}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Thứ tự</dt>
            <dd className="mt-1 text-sm font-medium text-brand-dark">{collection.collection_sort_order ?? 0}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-lg bg-brand-gray px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">URL storefront (dự kiến)</p>
          <code className="mt-1 block text-sm font-mono text-brand-primary break-all">{storefrontPath}</code>
          <p className="mt-2 text-xs text-gray-500">
            Banner hero có thể trỏ link này khi triển khai FE.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-brand-dark">Sản phẩm trong bộ sưu tập</h3>
          <p className="text-xs text-gray-500 mt-0.5">Thứ tự như danh sách dưới đây</p>
        </div>

        {!products.length ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">Chưa có sản phẩm</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {products.map((product, index) => {
              const price = getProductPriceDisplay(product);
              const code = pickProductCodeFromApi(product);
              return (
                <li key={product._id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-gray-400 tabular-nums">
                    {index + 1}
                  </span>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-gray">
                    {product.product_thumb ? (
                      <OptimizedImage
                        src={product.product_thumb}
                        alt={product.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product._id}`}
                      className="truncate font-semibold text-brand-dark hover:text-brand-primary"
                    >
                      {product.product_name}
                    </Link>
                    {code ? (
                      <p className="text-xs text-gray-500 font-mono">{code}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm font-bold text-brand-dark whitespace-nowrap">
                    {price}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
