'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/assertPermission';
import {
  createBanner,
  deleteBanner,
  publishBanner,
  unpublishBanner,
  updateBanner,
} from '@/lib/api/banner';
import { getCategories, getCategoryLevel2Picker } from '@/lib/api/category';
import {
  bannerSchema,
  formatBannerSchemaError,
  toBannerApiBody,
} from '@/lib/banners/bannerSchema';
import { notifyStorefrontRevalidate } from '@/lib/shared/storefrontRevalidate';
import { mutationErrorMessage } from '@/lib/shared/actionError';

async function revalidateBanners(bannerId) {
  updateTag('banners');
  updateTag('banner-stats');
  if (bannerId) updateTag(`banner-${bannerId}`);
  revalidatePath('/banners');
  // Xóa cache banner trên storefront FE (fire-and-forget — không block nếu FE down)
  await notifyStorefrontRevalidate('banners');
}

/**
 * @param {FormData} formData
 */
function parseBannerFormData(formData) {
  return {
    kind: formData.get('kind')?.toString() ?? 'hero_slider',
    title: formData.get('title')?.toString() ?? '',
    placement: formData.get('placement')?.toString() ?? '',
    category_id: formData.get('category_id')?.toString() ?? '',
    desktop_url: formData.get('desktop_url')?.toString() ?? '',
    mobile_url: formData.get('mobile_url')?.toString() ?? '',
    link: formData.get('link')?.toString() ?? '',
    sort_order: formData.get('sort_order')?.toString() ?? '0',
    is_active: formData.get('is_active') === 'true',
  };
}

/** Options danh mục L1 + L2 cho form banner strip */
export async function loadBannerCategoryOptionsAction() {
  const denied = await requirePermission('read:any', 'banner');
  if (denied) return [];

  try {
    const [l1Hat, l1Sua, l2Hat, l2Sua] = await Promise.all([
      getCategories({ level: 1, product_type: 'dryseed', status: 'active', limit: 20 }),
      getCategories({ level: 1, product_type: 'milkseed', status: 'active', limit: 20 }),
      getCategoryLevel2Picker({ product_type: 'dryseed' }),
      getCategoryLevel2Picker({ product_type: 'milkseed' }),
    ]);

    const l1Items = [...(l1Hat.items ?? []), ...(l1Sua.items ?? [])].map((c) => ({
      id: String(c._id),
      label: `[L1] ${c.category_name} (${c.category_product_type})`,
    }));

    const l2Items = [...(l2Hat ?? []), ...(l2Sua ?? [])].map((c) => ({
      id: String(c._id ?? c.id),
      label: `[L2] ${c.category_name ?? c.name} (${c.category_product_type ?? c.product_type ?? ''})`,
    }));

    return [...l1Items, ...l2Items];
  } catch {
    return [];
  }
}

export async function createBannerAction(prevState, formData) {
  const denied = await requirePermission('create:any', 'banner');
  if (denied) return denied;

  const parsed = bannerSchema.safeParse(parseBannerFormData(formData));
  const validationError = formatBannerSchemaError(parsed);
  if (validationError) return validationError;

  try {
    const created = await createBanner(toBannerApiBody(parsed.data));
    const id = created?._id?.toString?.() ?? created?._id;
    await revalidateBanners(id);
    return { success: true, bannerId: id };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Tạo slide banner thất bại') };
  }
}

/**
 * @param {string} bannerId
 */
export async function updateBannerAction(bannerId, prevState, formData) {
  if (!bannerId) return { error: 'Thiếu ID slide banner' };

  const denied = await requirePermission('update:any', 'banner');
  if (denied) return denied;

  const parsed = bannerSchema.safeParse(parseBannerFormData(formData));
  const validationError = formatBannerSchemaError(parsed);
  if (validationError) return validationError;

  try {
    await updateBanner(bannerId, toBannerApiBody(parsed.data));
    await revalidateBanners(bannerId);
    return { success: true, message: 'Đã cập nhật slide banner' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Cập nhật thất bại') };
  }
}

/** @param {string} bannerId */
export async function publishBannerAction(bannerId) {
  if (!bannerId) return { error: 'Thiếu ID slide banner' };

  const denied = await requirePermission('update:any', 'banner');
  if (denied) return denied;

  try {
    await publishBanner(bannerId);
    await revalidateBanners(bannerId);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xuất bản thất bại') };
  }
}

/** @param {string} bannerId */
export async function unpublishBannerAction(bannerId) {
  if (!bannerId) return { error: 'Thiếu ID slide banner' };

  const denied = await requirePermission('update:any', 'banner');
  if (denied) return denied;

  try {
    await unpublishBanner(bannerId);
    await revalidateBanners(bannerId);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Ẩn slide thất bại') };
  }
}

/** @param {string} bannerId */
export async function deleteBannerAction(bannerId) {
  if (!bannerId) return { error: 'Thiếu ID slide banner' };

  const denied = await requirePermission('delete:any', 'banner');
  if (denied) return denied;

  try {
    await deleteBanner(bannerId);
    await revalidateBanners(bannerId);
    redirect('/banners?toast=deleted');
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xóa slide thất bại') };
  }
}
