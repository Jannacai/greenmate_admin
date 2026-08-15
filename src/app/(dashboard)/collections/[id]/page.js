import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getCollectionById } from '@/lib/api/collection';
import { getProductsByIds } from '@/lib/api/product';
import CollectionDetailView from '@/components/collections/CollectionDetailView';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader, AdminErrorState } from '@/components/admin';

const getCollectionCached = cache(getCollectionById);

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const collection = await getCollectionCached(id);
    return { title: collection.collection_name };
  } catch {
    return { title: 'Chi tiết bộ sưu tập' };
  }
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function CollectionDetailPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('collection', permissions.grants);

  let collection = null;
  let products = [];
  let fetchError = null;

  try {
    collection = await getCollectionCached(id);
    const productIds = (collection.collection_product_ids ?? []).map(String);
    if (productIds.length) {
      const picker = await getProductsByIds({ ids: productIds, includeSkus: false });
      const byId = new Map((picker?.items ?? []).map((p) => [String(p._id), p]));
      products = productIds.map((pid) => byId.get(pid)).filter(Boolean);
    }
  } catch (err) {
    if (err?.message?.includes('404') || err?.message?.includes('Không tìm thấy')) {
      notFound();
    }
    fetchError = err?.message ?? 'Không tải được bộ sưu tập';
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <PageBackHeader
          backHref="/collections"
          backLabel="Quay lại danh sách"
          title="Chi tiết bộ sưu tập"
        />
        <AdminErrorState message={fetchError} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageBackHeader
        backHref="/collections"
        backLabel="Quay lại danh sách"
        title={collection.collection_name}
      />
      <CollectionDetailView
        collection={collection}
        products={products}
        canUpdate={caps.canUpdate}
        canDelete={caps.canDelete}
      />
    </div>
  );
}
