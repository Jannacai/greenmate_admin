import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCollectionById } from '@/lib/api/collection';
import DynamicCollectionForm from '@/components/collections/DynamicCollectionForm';
import CollectionStatusBadge from '@/components/collections/CollectionStatusBadge';
import { getCollectionStorefrontPath } from '@/lib/collections/collectionDisplay';
import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';
import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { PageBackHeader, AdminButtonOutline } from '@/components/admin';

export const dynamic = 'force-dynamic';

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const collection = await getCollectionById(id);
    if (collection?.collection_name) {
      return { title: `Sửa · ${collection.collection_name}` };
    }
  } catch {
    /* fallback */
  }
  return { title: 'Sửa bộ sưu tập' };
}

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function CollectionEditPage({ params }) {
  const { id } = await params;
  const permissions = await getCachedMyPermissions();
  const caps = getResourceCapabilities('collection', permissions.grants);

  if (!caps.canUpdate) {
    redirect(`/collections/${id}`);
  }

  let collection = null;

  try {
    collection = await getCollectionById(id);
  } catch {
    notFound();
  }

  if (!collection?._id) {
    notFound();
  }

  const storefrontPath = collection.storefront_path ?? getCollectionStorefrontPath(collection);

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <PageBackHeader
        backHref={`/collections/${id}`}
        backLabel="Quay lại chi tiết"
        title="Sửa bộ sưu tập"
        badge={<CollectionStatusBadge collection={collection} />}
        action={(
          <Link href={`/collections/${id}`} className="inline-flex shrink-0">
            <AdminButtonOutline type="button">Xem chi tiết</AdminButtonOutline>
          </Link>
        )}
      />

      <div className="mb-5 rounded-xl border border-gray-200 bg-brand-gray/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">URL storefront</p>
        <code className="mt-1 block text-sm font-mono text-brand-primary break-all">{storefrontPath}</code>
        <p className="mt-2 text-xs text-gray-500">
          Slug: <span className="font-mono font-medium text-brand-dark">{collection.collection_slug}</span>
        </p>
      </div>

      <DynamicCollectionForm
        mode="edit"
        collectionId={id}
        initial={collection}
        canSubmit
        cancelHref={`/collections/${id}`}
      />
    </div>
  );
}
