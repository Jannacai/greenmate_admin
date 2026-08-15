'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/assertPermission';
import {
  createCollection,
  deleteCollection,
  getCollectionById,
  publishCollection,
  unpublishCollection,
  updateCollection,
} from '@/lib/api/collection';
import {
  collectionSchema,
  formatCollectionSchemaError,
  toCollectionApiBody,
} from '@/lib/collections/collectionSchema';
import { mutationErrorMessage } from '@/lib/shared/actionError';

function revalidateCollections(collectionId) {
  updateTag('collections');
  updateTag('collection-stats');
  if (collectionId) updateTag(`collection-${collectionId}`);
  revalidatePath('/collections');
}

/**
 * @param {FormData} formData
 */
function parseCollectionFormData(formData) {
  const productIdsRaw = formData.get('product_ids')?.toString() ?? '';
  const product_ids = productIdsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    name: formData.get('name')?.toString() ?? '',
    slug: formData.get('slug')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    product_ids,
    sort_order: formData.get('sort_order')?.toString() ?? '0',
    is_active: formData.get('is_active') === 'true',
  };
}

export async function createCollectionAction(prevState, formData) {
  const denied = await requirePermission('create:any', 'collection');
  if (denied) return denied;

  const parsed = collectionSchema.safeParse(parseCollectionFormData(formData));
  const validationError = formatCollectionSchemaError(parsed);
  if (validationError) return validationError;

  try {
    const created = await createCollection(toCollectionApiBody(parsed.data));
    const id = created?._id?.toString?.() ?? created?._id;
    revalidateCollections(id);
    return { success: true, collectionId: id };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Tạo bộ sưu tập thất bại') };
  }
}

/**
 * @param {string} collectionId
 */
export async function updateCollectionAction(collectionId, prevState, formData) {
  if (!collectionId) return { error: 'Thiếu ID bộ sưu tập' };

  const denied = await requirePermission('update:any', 'collection');
  if (denied) return denied;

  const parsed = collectionSchema.safeParse(parseCollectionFormData(formData));
  const validationError = formatCollectionSchemaError(parsed);
  if (validationError) return validationError;

  try {
    await updateCollection(collectionId, toCollectionApiBody(parsed.data));
    revalidateCollections(collectionId);
    return { success: true, message: 'Đã cập nhật bộ sưu tập' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Cập nhật thất bại') };
  }
}

/**
 * @param {string} collectionId
 */
export async function publishCollectionAction(collectionId) {
  if (!collectionId) return { error: 'Thiếu ID bộ sưu tập' };

  const denied = await requirePermission('update:any', 'collection');
  if (denied) return denied;

  try {
    await publishCollection(collectionId);
    revalidateCollections(collectionId);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xuất bản thất bại') };
  }
}

/**
 * @param {string} collectionId
 */
export async function unpublishCollectionAction(collectionId) {
  if (!collectionId) return { error: 'Thiếu ID bộ sưu tập' };

  const denied = await requirePermission('update:any', 'collection');
  if (denied) return denied;

  try {
    await unpublishCollection(collectionId);
    revalidateCollections(collectionId);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Ẩn bộ sưu tập thất bại') };
  }
}

/**
 * @param {string} collectionId
 */
export async function deleteCollectionAction(collectionId) {
  if (!collectionId) return { error: 'Thiếu ID bộ sưu tập' };

  const denied = await requirePermission('delete:any', 'collection');
  if (denied) return denied;

  try {
    await deleteCollection(collectionId);
    revalidateCollections(collectionId);
    redirect('/collections?toast=deleted');
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xóa bộ sưu tập thất bại') };
  }
}

/**
 * @param {string} collectionId
 */
export async function getCollectionDetailAction(collectionId) {
  const denied = await requirePermission('read:any', 'collection');
  if (denied) return denied;

  try {
    const data = await getCollectionById(collectionId);
    return { data };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không tải được bộ sưu tập') };
  }
}
