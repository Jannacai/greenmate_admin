'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAnyPermission, requirePermission } from '@/lib/auth/assertPermission';
import {
  createCategory,
  deleteCategory,
  getCategoryLevel2Picker,
  publishCategory,
  unpublishCategory,
  updateCategory,
} from '@/lib/api/category';
import {
  categoryFormSchema,
  formatCategorySchemaError,
  toCategoryApiBody,
} from '@/lib/categories/categorySchema';

import { notifyStorefrontRevalidate } from '@/lib/shared/storefrontRevalidate';
import { mutationErrorMessage } from '@/lib/shared/actionError';

async function revalidateCategories(categoryId, slug) {
  updateTag('categories');
  updateTag('category-stats');
  updateTag('category-picker');
  if (categoryId) updateTag(`category-${categoryId}`);
  revalidatePath('/categories');
  await notifyStorefrontRevalidate('categories');
  if (slug) {
    await notifyStorefrontRevalidate(`category:${slug}`);
  }
}

/**
 * @param {FormData} formData
 */
function parseCategoryFormData(formData) {
  return {
    name: formData.get('name')?.toString() ?? '',
    slug: formData.get('slug')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    image: formData.get('image')?.toString() ?? '',
    product_type: formData.get('product_type')?.toString() ?? 'dryseed',
    sort_order: formData.get('sort_order')?.toString() ?? '0',
    is_active: formData.get('is_active') === 'true',
  };
}

export async function createCategoryAction(prevState, formData) {
  const denied = await requirePermission('create:any', 'category');
  if (denied) return denied;

  const parsed = categoryFormSchema.safeParse(parseCategoryFormData(formData));
  const validationError = formatCategorySchemaError(parsed);
  if (validationError) return validationError;

  try {
    const created = await createCategory(toCategoryApiBody(parsed.data));
    const id = created?._id?.toString?.() ?? created?._id;
    const slug = created?.category_slug ?? parsed.data.slug;
    await revalidateCategories(id, slug);
    return { success: true, categoryId: id };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Tạo danh mục thất bại') };
  }
}

/** @param {string} categoryId */
export async function updateCategoryAction(categoryId, prevState, formData) {
  if (!categoryId) return { error: 'Thiếu ID danh mục' };

  const denied = await requirePermission('update:any', 'category');
  if (denied) return denied;

  const parsed = categoryFormSchema.safeParse(parseCategoryFormData(formData));
  const validationError = formatCategorySchemaError(parsed);
  if (validationError) return validationError;

  try {
    const updated = await updateCategory(categoryId, toCategoryApiBody(parsed.data));
    await revalidateCategories(categoryId, updated?.category_slug ?? parsed.data.slug);
    return { success: true, message: 'Đã cập nhật danh mục' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Cập nhật thất bại') };
  }
}

/** @param {string} categoryId */
export async function publishCategoryAction(categoryId) {
  if (!categoryId) return { error: 'Thiếu ID danh mục' };
  const denied = await requirePermission('update:any', 'category');
  if (denied) return denied;

  try {
    await publishCategory(categoryId);
    await revalidateCategories(categoryId);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Kích hoạt thất bại') };
  }
}

/** @param {string} categoryId */
export async function unpublishCategoryAction(categoryId) {
  if (!categoryId) return { error: 'Thiếu ID danh mục' };
  const denied = await requirePermission('update:any', 'category');
  if (denied) return denied;

  try {
    await unpublishCategory(categoryId);
    await revalidateCategories(categoryId);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Ẩn danh mục thất bại') };
  }
}

/** @param {string} categoryId */
export async function deleteCategoryAction(categoryId) {
  if (!categoryId) return { error: 'Thiếu ID danh mục' };
  const denied = await requirePermission('delete:any', 'category');
  if (denied) return denied;

  try {
    await deleteCategory(categoryId);
    await revalidateCategories(categoryId);
    redirect('/categories?toast=deleted');
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xóa danh mục thất bại') };
  }
}

/** @param {string} [productType] */
export async function getCategoryLevel2OptionsAction(productType) {
  const denied = await requireAnyPermission('read:any', ['product', 'category']);
  if (denied) return { error: denied.error, items: [] };

  try {
    const items = await getCategoryLevel2Picker({
      product_type: productType,
    });
    return { items: Array.isArray(items) ? items : [] };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không tải danh mục'), items: [] };
  }
}
