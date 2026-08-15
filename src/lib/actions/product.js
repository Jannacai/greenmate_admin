'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createProduct,
  updateProduct,
  publishProduct,
  unpublishProduct,
  deleteProduct,
  getProductById,
  searchProductsForPicker,
  getProductsByIds,
} from '@/lib/api/product';
import { cleanupOrphanImagesAction, cleanupOrphanVideosAction } from '@/lib/actions/upload';
import { formatProductSchemaError, validateProductPayload } from '@/lib/products/productSchema';
import {
  mapProductMutationError,
  validateProductCodeUnique,
} from '@/lib/products/productCodeValidation';
import {
  getEligibleProductVouchers,
} from '@/lib/products/productVoucherPicker.server';
import {
  sanitizeProductVoucherForSave,
} from '@/lib/products/productVoucherPicker';
import { requirePermission } from '@/lib/auth/assertPermission';
import { getAdminShopOwnerId } from '@/lib/auth/shopContext';
import { notifyStorefrontRevalidate } from '@/lib/shared/storefrontRevalidate';
import { mutationErrorMessage } from '@/lib/shared/actionError';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

/**
 * Invalidate tất cả cache liên quan đến sản phẩm.
 * Gọi sau mỗi mutation.
 *
 * @param {string} [productId]
 * @param {string} [productSlug]
 * @param {string} [categorySlug]
 */
async function revalidateProducts(productId, productSlug, categorySlug) {
  updateTag('products');
  updateTag('products-published');
  updateTag('products-draft');
  updateTag('products-admin-list');
  updateTag('products-picker');
  updateTag('products-by-ids');
  updateTag('discount-scope');
  if (productId) updateTag(`product-${productId}`);

  await notifyStorefrontRevalidate('products');

  let slug = typeof productSlug === 'string' ? productSlug.trim().toLowerCase() : '';
  let catSlug = typeof categorySlug === 'string' ? categorySlug.trim().toLowerCase() : '';

  if (productId && (!slug || !catSlug)) {
    const meta = await resolveProductRevalidateMeta(productId);
    slug = slug || meta.slug;
    catSlug = catSlug || meta.categorySlug;
  }

  if (slug) {
    await notifyStorefrontRevalidate(`product:${slug}`);
  }
  if (productId) {
    await notifyStorefrontRevalidate(`product:id:${productId}`);
  }
  if (catSlug && slug) {
    await notifyStorefrontRevalidate(`pdp:${catSlug}/${slug}`);
  }
  if (catSlug) {
    await notifyStorefrontRevalidate(`products:cat:${catSlug}`);
  }
}

/**
 * @param {string} productId
 * @returns {Promise<{ slug: string, categorySlug: string }>}
 */
async function resolveProductRevalidateMeta(productId) {
  if (!productId) return { slug: '', categorySlug: '' };
  try {
    const product = await getProductById(productId);
    return {
      slug: product?.product_slug?.trim().toLowerCase() ?? '',
      categorySlug: product?.product_category_slug?.trim().toLowerCase() ?? '',
    };
  } catch {
    return { slug: '', categorySlug: '' };
  }
}

/** @param {string} productId */
async function resolveProductSlugForRevalidate(productId) {
  const meta = await resolveProductRevalidateMeta(productId);
  return meta.slug;
}

/**
 * Quy tắc `product_voucher` khi lưu SP — đồng bộ tipjs §XV.
 * @param {object} payload
 * @param {{ productId?: string }} [opts]
 */
async function enforceProductVoucherRules(payload, opts = {}) {
  const eligibleVouchers = await getEligibleProductVouchers();
  let appliedActive = null;

  if (opts.productId) {
    try {
      const product = await getProductById(opts.productId);
      if (product?.has_voucher_discount && product?.active_voucher?.code) {
        appliedActive = product.active_voucher;
      }
    } catch {
      appliedActive = null;
    }
  }

  const result = sanitizeProductVoucherForSave(
    payload.product_voucher?.code,
    eligibleVouchers,
    appliedActive,
  );

  if (result.error) {
    return { fieldErrors: { voucher_code: [result.error] } };
  }

  return { payload: { ...payload, product_voucher: result.product_voucher } };
}

/** @param {{ removedImageUrls?: string[], removedVideoUrls?: string[] }} opts */
async function cleanupRemovedMedia(opts) {
  if (opts?.removedImageUrls?.length) {
    await cleanupOrphanImagesAction(opts.removedImageUrls);
  }
  if (opts?.removedVideoUrls?.length) {
    await cleanupOrphanVideosAction(opts.removedVideoUrls);
  }
}

/**
 * Lấy _id sản phẩm từ response API create/update.
 * @param {any} res
 */
function extractProductIdFromApiResponse(res) {
  const meta = res?.metadata ?? res;
  return (
    meta?.newProduct?._id ??
    meta?.data?.newProduct?._id ??
    meta?.updated?._id ??
    meta?.data?._id ??
    meta?._id ??
    null
  );
}

/* ─────────────────────────────────────────
   SERVER ACTIONS
───────────────────────────────────────── */

/**
 * Tạo sản phẩm mới.
 * Nhận plain object (không phải FormData) — gọi trực tiếp từ client via startTransition.
 *
 * @param {object} productData  — full product payload
 * @param {{ publish?: boolean, removedImageUrls?: string[], removedVideoUrls?: string[] }} [opts]
 * @returns {{ error?: string, fieldErrors?: Record<string, string[]>, success?: boolean, toast?: string }}
 */
export async function createProductAction(productData, opts = {}) {
  const denied = await requirePermission('create:any', 'product');
  if (denied) return denied;

  const shopOwnerId = await getAdminShopOwnerId();

  const payload = {
    ...productData,
    ...(shopOwnerId ? { product_shop: shopOwnerId } : {}),
  };

  const validation = validateProductPayload(payload, { mode: 'create' });
  const validationError = formatProductSchemaError(validation);
  if (validationError) return validationError;

  const safePayload = validation.data;

  const voucherCheck = await enforceProductVoucherRules(safePayload);
  if (voucherCheck.fieldErrors) return { fieldErrors: voucherCheck.fieldErrors };
  const finalPayload = voucherCheck.payload;

  const codeCheck = await validateProductCodeUnique(finalPayload.product_code);
  if (codeCheck?.fieldErrors) return codeCheck;

  let productId;
  try {
    const res = await createProduct(finalPayload);
    productId = extractProductIdFromApiResponse(res);
    if (!productId) {
      return { error: 'Tạo sản phẩm thất bại — không nhận được ID từ server' };
    }
    await revalidateProducts(productId, finalPayload.product_slug);
  } catch (err) {
    return mapProductMutationError(err);
  }

  await cleanupRemovedMedia(opts);

  if (opts.publish) {
    try {
      await publishProduct(productId);
      await revalidateProducts(productId, finalPayload.product_slug);
      return { success: true, toast: 'published' };
    } catch {
      return { success: true, toast: 'error' };
    }
  }

  return { success: true, toast: 'draft' };
}

/**
 * Cập nhật sản phẩm đầy đủ — PATCH /product/:productId
 * Body cần có product_type (backend chọn DrySeed/Combo class).
 *
 * @param {string} productId
 * @param {object} productData
 * @param {{ publish?: boolean, removedImageUrls?: string[], removedVideoUrls?: string[] }} [opts]
 * @returns {{ error?: string, fieldErrors?: Record<string, string[]>, success?: boolean, toast?: string }}
 */
export async function updateProductFullAction(productId, productData, opts = {}) {
  if (!productId) return { error: 'Thiếu ID sản phẩm' };

  const denied = await requirePermission('update:any', 'product');
  if (denied) return denied;

  const shopOwnerId = await getAdminShopOwnerId();

  const payload = {
    ...productData,
    ...(shopOwnerId ? { product_shop: shopOwnerId } : {}),
  };

  const validation = validateProductPayload(payload, { mode: 'update' });
  const validationError = formatProductSchemaError(validation);
  if (validationError) return validationError;

  const safePayload = validation.data;

  const voucherCheck = await enforceProductVoucherRules(safePayload, { productId });
  if (voucherCheck.fieldErrors) return { fieldErrors: voucherCheck.fieldErrors };
  const finalPayload = voucherCheck.payload;

  const codeCheck = await validateProductCodeUnique(finalPayload.product_code, productId);
  if (codeCheck?.fieldErrors) return codeCheck;

  try {
    await updateProduct(productId, finalPayload);
    await revalidateProducts(productId, finalPayload.product_slug);
  } catch (err) {
    return mapProductMutationError(err);
  }

  await cleanupRemovedMedia(opts);

  if (opts.publish) {
    try {
      await publishProduct(productId);
      await revalidateProducts(productId, finalPayload.product_slug);
      return { success: true, toast: 'published' };
    } catch {
      return { success: true, toast: 'error' };
    }
  }

  return { success: true, toast: 'updated' };
}

/**
 * Publish sản phẩm (draft → published).
 * Quick action — gọi trực tiếp, không cần form.
 *
 * @param {string} productId
 * @returns {{ success?: boolean, error?: string }}
 */
export async function publishProductAction(productId) {
  if (!productId) return { error: 'Thiếu ID sản phẩm' };

  const denied = await requirePermission('update:any', 'product');
  if (denied) return denied;

  try {
    await publishProduct(productId);
    const slug = await resolveProductSlugForRevalidate(productId);
    await revalidateProducts(productId, slug);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Publish sản phẩm thất bại') };
  }
}

/**
 * Unpublish sản phẩm (published → draft).
 * Quick action — gọi trực tiếp, không cần form.
 *
 * @param {string} productId
 * @returns {{ success?: boolean, error?: string }}
 */
export async function unpublishProductAction(productId) {
  if (!productId) return { error: 'Thiếu ID sản phẩm' };

  const denied = await requirePermission('update:any', 'product');
  if (denied) return denied;

  try {
    await unpublishProduct(productId);
    const slug = await resolveProductSlugForRevalidate(productId);
    await revalidateProducts(productId, slug);
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Unpublish sản phẩm thất bại') };
  }
}

/**
 * Xóa sản phẩm — cần quyền delete:any.
 *
 * @param {string} productId
 * @param {{ fromList?: boolean }} [opts]
 * @returns {{ success?: boolean, error?: string }}
 */
export async function deleteProductAction(productId, opts = {}) {
  if (!productId) return { error: 'Thiếu ID sản phẩm' };

  const denied = await requirePermission('delete:any', 'product');
  if (denied) return denied;

  try {
    const slug = await resolveProductSlugForRevalidate(productId);
    await deleteProduct(productId);
    await revalidateProducts(productId, slug);
    if (opts.fromList) {
      return { success: true };
    }
    redirect('/products?toast=deleted');
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xóa sản phẩm thất bại') };
  }
}

/**
 * Tải SP đầy đủ (kèm SKU) cho popover chi tiết giá trên danh sách.
 * @param {string} productId
 */
export async function getProductPriceDetailAction(productId) {
  if (!productId) return { error: 'Thiếu ID sản phẩm' };

  const denied = await requirePermission('read:any', 'product');
  if (denied) return denied;

  try {
    const product = await getProductById(productId);
    return { product };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không tải được chi tiết giá') };
  }
}

/**
 * Tìm SP cho picker voucher — search server.
 * @param {{ search?: string, page?: number, limit?: number }} params
 */
export async function searchVoucherPickerProductsAction({
  search = '',
  page = 1,
  limit = 20,
} = {}) {
  const denied = await requirePermission('read:any', 'product');
  if (denied) return denied;

  try {
    const result = await searchProductsForPicker({
      search,
      page,
      limit,
      status: 'all',
    });
    return { success: true, ...result };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không tìm được sản phẩm') };
  }
}

/**
 * Tải SP đã chọn (kể cả draft) — dùng khi sửa voucher.
 * @param {{ ids?: string[], skuIds?: string[] }} params
 */
export async function getVoucherPickerProductsByIdsAction({
  ids = [],
  skuIds = [],
} = {}) {
  const denied = await requirePermission('read:any', 'product');
  if (denied) return denied;

  try {
    const result = await getProductsByIds({
      ids,
      skuIds,
      includeSkus: true,
    });
    return { success: true, ...result };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không tải được sản phẩm đã chọn') };
  }
}
