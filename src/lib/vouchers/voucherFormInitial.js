import { getProductsByIds } from '@/lib/api/product';
import { stringifyMongoId } from '@/lib/shared/utils';

/**
 * Chuẩn hóa voucher cho form sửa — luôn dùng phạm vi theo sản phẩm (`specific`).
 * - `specific` → giữ `discount_product_ids`
 * - `specific_sku` → suy ra danh sách sản phẩm từ SKU đã lưu
 *
 * @param {object | null | undefined} discount
 * @returns {Promise<object | null | undefined>}
 */
export async function normalizeVoucherForProductForm(discount) {
  if (!discount) return discount;

  const appliesTo = discount.discount_applies_to ?? 'all';
  if (appliesTo === 'all') return discount;

  if (appliesTo === 'specific') {
    return {
      ...discount,
      discount_product_ids: (discount.discount_product_ids ?? []).map(String),
    };
  }

  if (appliesTo === 'specific_sku') {
    const skuIds = (discount.discount_sku_ids ?? []).map(String);
    if (!skuIds.length) {
      return {
        ...discount,
        discount_applies_to: 'specific',
        discount_product_ids: [],
        discount_sku_ids: [],
      };
    }

    const { items = [] } = await getProductsByIds({
      skuIds,
      includeSkus: true,
    });

    const productIds = new Set();
    for (const product of items) {
      productIds.add(stringifyMongoId(product._id));
    }

    return {
      ...discount,
      discount_applies_to: 'specific',
      discount_product_ids: [...productIds],
      discount_sku_ids: [],
    };
  }

  return discount;
}

/** @deprecated Dùng {@link normalizeVoucherForProductForm} */
export async function normalizeVoucherForSkuForm(discount) {
  return normalizeVoucherForProductForm(discount);
}
