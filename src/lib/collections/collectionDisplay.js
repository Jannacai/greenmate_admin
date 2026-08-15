import { getCollectionLifecycleStatus } from '@/lib/collections/collectionSchema';

export const COLLECTION_STATUS_CONFIG = {
  active: {
    label: 'Đang hiển thị',
    dot: 'bg-green-600',
    text: 'text-green-800',
    className: 'bg-green-100 text-green-900 ring-green-300',
  },
  inactive: {
    label: 'Đã ẩn',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
};

/**
 * @param {object} collection
 */
export function getCollectionStorefrontPath(collection) {
  const slug = collection?.collection_slug;
  return slug ? `/bo-suu-tap/${slug}` : '';
}

/**
 * @param {object} collection
 */
export function getCollectionProductCount(collection) {
  if (typeof collection?.product_count === 'number') return collection.product_count;
  return Array.isArray(collection?.collection_product_ids)
    ? collection.collection_product_ids.length
    : 0;
}

/**
 * @param {object} collection
 */
export function getCollectionStatusKey(collection) {
  return collection?.lifecycle_status ?? getCollectionLifecycleStatus(collection);
}
