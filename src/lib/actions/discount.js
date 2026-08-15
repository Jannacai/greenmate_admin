'use server';

import { revalidatePath, updateTag } from 'next/cache';
import {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  publishDiscount,
  unpublishDiscount,
  cancelUserDiscount,
  getDiscountScopeProducts,
  getNarrowVoucherProductLocks,
  getDiscountById,
} from '@/lib/api/discount';
import { getProductsByIds } from '@/lib/api/product';
import { formatVoucherSchemaError, toDiscountApiBody, voucherSchema } from '@/lib/vouchers/voucherSchema';
import { requirePermission } from '@/lib/auth/assertPermission';
import { getAdminShopOwnerId } from '@/lib/auth/shopContext';
import { mapDiscountScopeApiToRows } from '@/lib/vouchers/voucherScopeFromApi';
import { notifyStorefrontRevalidate } from '@/lib/shared/storefrontRevalidate';
import { mutationErrorMessage } from '@/lib/shared/actionError';

async function revalidateDiscounts(discountId) {
  updateTag('discounts');
  updateTag('discount-stats');
  updateTag('discount-eligible-product');
  updateTag('discount-scope');
  if (discountId) {
    updateTag(`discount-${discountId}`);
    updateTag(`discount-scope-${discountId}`);
  }
  revalidatePath('/vouchers');
  updateTag('products');
  updateTag('products-published');
  updateTag('products-draft');
  updateTag('products-admin-list');
  updateTag('products-picker');
  updateTag('products-by-ids');
  // Voucher đổi → giá/strip SP + phiếu voucher giỏ hàng trên storefront FE
  await notifyStorefrontRevalidate('products');
  await notifyStorefrontRevalidate('discounts');
  const shopId = await getAdminShopOwnerId();
  if (shopId) {
    await notifyStorefrontRevalidate(`discounts:public:${shopId}`);
  }
  await notifyStorefrontPdpFromDiscount(discountId);
}

/**
 * Invalidate cache PDP storefront cho SP trong phạm vi voucher (specific / specific_sku).
 * Voucher toàn shop (`all`) — FE revalidatePath layout qua tag `products`.
 *
 * @param {string} [discountId]
 */
async function notifyStorefrontPdpFromDiscount(discountId) {
  if (!discountId) return;

  try {
    const discount = await getDiscountById(discountId);
    const appliesTo = discount?.discount_applies_to ?? 'all';
    if (appliesTo === 'all') return;

    /** @type {string[]} */
    let productIds = [];

    if (appliesTo === 'specific') {
      productIds = (discount.discount_product_ids ?? []).map((id) => String(id)).filter(Boolean);
    } else if (appliesTo === 'specific_sku') {
      const scope = await getDiscountScopeProducts(discountId, { page: 1, limit: 100 });
      const seen = new Set();
      for (const row of scope?.sku_items ?? []) {
        const id = row?.product?._id;
        if (id) seen.add(String(id));
      }
      productIds = [...seen];
    }

    if (!productIds.length) return;

    const { items } = await getProductsByIds({ ids: productIds, includeSkus: false });
    const notified = new Set();

    for (const product of items ?? []) {
      const id = product?._id ? String(product._id) : '';
      const slug = product?.product_slug?.trim().toLowerCase() ?? '';
      const catSlug = product?.product_category_slug?.trim().toLowerCase() ?? '';
      const key = id || slug;
      if (!key || notified.has(key)) continue;
      notified.add(key);

      if (slug) await notifyStorefrontRevalidate(`product:${slug}`);
      if (id) await notifyStorefrontRevalidate(`product:id:${id}`);
      if (slug && catSlug) await notifyStorefrontRevalidate(`pdp:${catSlug}/${slug}`);
      if (catSlug) await notifyStorefrontRevalidate(`products:cat:${catSlug}`);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[revalidate] PDP từ voucher:', err?.message);
    }
  }
}

/**
 * @param {FormData} formData
 */
function parseVoucherFormData(formData) {
  const productIdsRaw = (formData.get('product_ids') ?? '').toString();
  const skuIdsRaw = (formData.get('sku_ids') ?? '').toString();

  return {
    name: (formData.get('name') ?? '').toString(),
    description: (formData.get('description') ?? '').toString(),
    code: (formData.get('code') ?? '').toString(),
    type: (formData.get('type') ?? 'percentage').toString(),
    value: formData.get('value'),
    start_date: (formData.get('start_date') ?? '').toString(),
    end_date: (formData.get('end_date') ?? '').toString(),
    is_active: formData.get('is_active') === 'on' || formData.get('is_active') === 'true',
    max_uses: formData.get('max_uses'),
    max_uses_per_user: formData.get('max_uses_per_user'),
    min_order_value: formData.get('min_order_value'),
    applies_to: (formData.get('applies_to') ?? 'all').toString(),
    product_ids: productIdsRaw ? productIdsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
    sku_ids: skuIdsRaw
      ? skuIdsRaw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
      : [],
  };
}

/**
 * @param {Object|null} prevState
 * @param {FormData} formData
 */
export async function createVoucherAction(prevState, formData) {
  const denied = await requirePermission('create:any', 'discount');
  if (denied) return denied;

  const parsed = voucherSchema.safeParse(parseVoucherFormData(formData));
  const validationError = formatVoucherSchemaError(parsed);
  if (validationError) return validationError;

  try {
    const res = await createDiscount(toDiscountApiBody(parsed.data));
    const discountId =
      res?.metadata?._id ??
      res?.metadata?.data?._id ??
      res?._id ??
      null;

    await revalidateDiscounts(discountId);

    return {
      success: true,
      message: 'Đã tạo voucher thành công',
      discountId,
    };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể tạo voucher') };
  }
}

/**
 * @param {string} discountId
 * @param {Object|null} prevState
 * @param {FormData} formData
 */
export async function updateVoucherAction(discountId, prevState, formData) {
  const denied = await requirePermission('update:any', 'discount');
  if (denied) return denied;

  const parsed = voucherSchema.safeParse(parseVoucherFormData(formData));
  const validationError = formatVoucherSchemaError(parsed);
  if (validationError) return validationError;

  try {
    await updateDiscount(discountId, toDiscountApiBody(parsed.data));
    await revalidateDiscounts(discountId);
    return { success: true, message: 'Đã cập nhật voucher' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể cập nhật voucher') };
  }
}

/**
 * Map lỗi kích hoạt voucher sang tiếng Việt.
 * @param {string} [message]
 */
function mapPublishVoucherError(message) {
  if (!message) return 'Không thể kích hoạt voucher';
  const lower = message.toLowerCase();
  if (lower.includes('hết hạn') || lower.includes('expired')) {
    return 'Voucher đã hết hạn. Chỉnh sửa và gia hạn ngày kết thúc trước khi kích hoạt lại.';
  }
  return message;
}

/**
 * Kích hoạt voucher (discount_is_active = true).
 * @param {string} discountId
 */
export async function publishVoucherAction(discountId) {
  if (!discountId) return { error: 'Thiếu ID voucher' };

  const denied = await requirePermission('update:any', 'discount');
  if (denied) return denied;

  try {
    await publishDiscount(discountId);
    await revalidateDiscounts(discountId);
    return { success: true, message: 'Đã kích hoạt voucher' };
  } catch (err) {
    return { error: mapPublishVoucherError(err.message) };
  }
}

/**
 * Tắt voucher (discount_is_active = false).
 * @param {string} discountId
 */
export async function unpublishVoucherAction(discountId) {
  if (!discountId) return { error: 'Thiếu ID voucher' };

  const denied = await requirePermission('update:any', 'discount');
  if (denied) return denied;

  try {
    await unpublishDiscount(discountId);
    await revalidateDiscounts(discountId);
    return { success: true, message: 'Đã tắt voucher' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể tắt voucher') };
  }
}

/** @param {string} code */
export async function deleteVoucherAction(code) {
  const denied = await requirePermission('delete:any', 'discount');
  if (denied) return denied;

  try {
    await deleteDiscount(code);
    await revalidateDiscounts();
    return { success: true };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể xóa voucher') };
  }
}

/**
 * Gỡ khách hàng khỏi danh sách đã dùng voucher (admin tool).
 * @param {{ code: string, userId: string }} params
 */
export async function cancelUserVoucherAction({ code, userId }) {
  const denied = await requirePermission('update:any', 'discount');
  if (denied) return denied;

  const shopId = await getAdminShopOwnerId();
  if (!shopId) {
    return { error: 'Thiếu shop context' };
  }

  try {
    await cancelUserDiscount({ code, shopId, userId });
    await revalidateDiscounts();
    return { success: true, message: 'Đã gỡ voucher khỏi khách hàng' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không thể gỡ voucher') };
  }
}

/**
 * SP đã có voucher hẹp — picker form tạo/sửa voucher.
 * @param {string} [excludeDiscountId] — khi sửa, bỏ qua voucher hiện tại
 */
export async function getNarrowVoucherProductLocksAction(excludeDiscountId) {
  const denied = await requirePermission('read:any', 'discount');
  if (denied) return denied;

  try {
    const locks = await getNarrowVoucherProductLocks({
      excludeDiscountId: excludeDiscountId || undefined,
    });
    return { success: true, ...locks };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không tải được danh sách khóa voucher') };
  }
}

/**
 * Sản phẩm thuộc voucher — hover popover danh sách voucher.
 *
 * @param {{ discountId: string, appliesTo?: string }} params
 */
export async function getVoucherScopeProductsAction({
  discountId,
  appliesTo = 'all',
}) {
  const denied = await requirePermission('read:any', 'discount');
  if (denied) return denied;

  if (!discountId) {
    return { error: 'Thiếu mã voucher' };
  }

  try {
    const api = await getDiscountScopeProducts(discountId, { page: 1, limit: 50 });
    const mapped = mapDiscountScopeApiToRows(api);

    return {
      ...mapped,
      total: mapped.items.length,
      note:
        mapped.isAllShop && appliesTo === 'all'
          ? 'Voucher áp dụng toàn shop.'
          : undefined,
      source: 'scope-api',
    };
  } catch (err) {
    return { error: err?.message ?? 'Không tải được sản phẩm voucher' };
  }
}
