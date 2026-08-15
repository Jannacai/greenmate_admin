import { getVoucherLifecycleStatus } from '@/lib/vouchers/voucherSchema';
import { getVoucherValueLabel } from '@/lib/vouchers/voucherDisplay';
import { stringifyMongoId } from '@/lib/shared/utils';

/**
 * Mã voucher để pre-fill form sửa SP — ưu tiên voucher đang tính vào giá (`active_voucher`),
 * sau đó mới tới `product_voucher` đã lưu DB.
 * @param {object} [product]
 * @returns {string}
 */
export function resolveProductFormVoucherCode(product) {
  if (product?.has_voucher_discount && product?.active_voucher?.code?.trim()) {
    return product.active_voucher.code.trim();
  }

  const stored = product?.product_voucher?.code?.trim();
  if (stored) return stored;

  return '';
}

/**
 * SP đang có voucher hệ thống áp vào giá (SKU / product scope) — khóa picker marketing.
 * @param {object} [product]
 */
export function isProductVoucherLockedToApplied(product) {
  return Boolean(product?.has_voucher_discount && product?.active_voucher?.code?.trim());
}

/**
 * @param {object} active
 * @returns {ReturnType<typeof serializeEligibleVoucherForPicker> | null}
 */
export function appliedVoucherToPickerOption(active) {
  if (!active?.code?.trim()) return null;

  const type = active.type === 'fixed_amount' || active.type === 'fixed'
    ? 'fixed_amount'
    : 'percentage';
  const value = Number(active.value ?? 0);

  return {
    id: `active-${active.code}`,
    code: active.code,
    name: active.name?.trim() || active.code,
    description: '',
    type,
    value,
    valueLabel: type === 'percentage' && value > 0
      ? `${Math.round(value)}%`
      : value > 0
        ? `${value.toLocaleString('vi-VN')}đ`
        : active.code,
    minOrder: 0,
  };
}

/**
 * Khớp mã voucher với option trong select (case-insensitive).
 * @param {string | null | undefined} code
 * @param {ReturnType<typeof serializeEligibleVoucherForPicker>[]} eligibleVouchers
 * @returns {string}
 */
export function matchEligibleVoucherCode(code, eligibleVouchers = []) {
  const trimmed = code?.trim();
  if (!trimmed) return '';
  const match = eligibleVouchers.find(
    (v) => v.code?.toUpperCase() === trimmed.toUpperCase(),
  );
  return match?.code ?? trimmed;
}

/**
 * Danh sách voucher trong select form SP.
 * Khi có voucher đang áp vào giá → chỉ option đó (không cho chọn toàn shop khác).
 * @param {object} [product]
 * @param {ReturnType<typeof serializeEligibleVoucherForPicker>[]} eligibleShopWide
 */
export function getProductFormVoucherOptions(product, eligibleShopWide = []) {
  if (isProductVoucherLockedToApplied(product)) {
    const applied = appliedVoucherToPickerOption(product.active_voucher);
    return applied ? [applied] : eligibleShopWide;
  }
  return eligibleShopWide;
}

/**
 * @deprecated Dùng {@link getProductFormVoucherOptions}
 */
export function mergeEligibleVouchersForProductForm(product, eligibleVouchers = []) {
  return getProductFormVoucherOptions(product, eligibleVouchers);
}

/**
 * Voucher đang active + áp dụng toàn shop — dùng picker trên form sản phẩm.
 * @param {object[]} discounts
 */
export function filterShopWideActiveVouchers(discounts = []) {
  return discounts.filter((discount) => {
    if (getVoucherLifecycleStatus(discount) !== 'active') return false;
    return (discount.discount_applies_to ?? 'all') === 'all';
  });
}

/**
 * @param {object} discount
 */
export function serializeEligibleVoucherForPicker(discount) {
  return {
    id: stringifyMongoId(discount._id),
    code: discount.discount_code ?? '',
    name: discount.discount_name ?? '',
    description: discount.discount_description ?? '',
    type: discount.discount_type ?? 'percentage',
    value: discount.discount_value ?? 0,
    valueLabel: getVoucherValueLabel(discount),
    minOrder: Number(discount.discount_min_order_value ?? 0),
  };
}

/**
 * @param {ReturnType<typeof serializeEligibleVoucherForPicker> | null | undefined} voucher
 */
export function eligibleVoucherToProductVoucher(voucher) {
  if (!voucher?.code) {
    return { code: null, text: null, desc: null };
  }

  return {
    code: voucher.code,
    text: voucher.name?.trim() || voucher.code,
    desc: voucher.description?.trim() || buildVoucherDescFallback(voucher),
  };
}

/**
 * Mô tả phụ lưu DB — không hiển thị trên strip card.
 * @param {ReturnType<typeof serializeEligibleVoucherForPicker>} voucher
 */
function buildVoucherDescFallback(voucher) {
  if (voucher.type === 'percentage' && voucher.value > 0) {
    return `GIẢM ${Math.round(Number(voucher.value))}%`;
  }
  if (voucher.value > 0) {
    return `GIẢM ${voucher.valueLabel}`;
  }
  return '';
}

/**
 * @param {string | null | undefined} code
 * @param {ReturnType<typeof serializeEligibleVoucherForPicker>[]} eligibleVouchers
 */
export function sanitizeProductVoucherSelection(code, eligibleVouchers = []) {
  const trimmed = code?.trim();
  if (!trimmed) {
    return { product_voucher: { code: null, text: null, desc: null } };
  }

  const matched = eligibleVouchers.find(
    (v) => v.code.toUpperCase() === trimmed.toUpperCase(),
  );

  if (!matched) {
    return {
      error: 'Voucher không hợp lệ hoặc không còn active / không áp dụng toàn shop',
    };
  }

  return { product_voucher: eligibleVoucherToProductVoucher(matched) };
}

/**
 * Validate + map `product_voucher` khi lưu SP.
 * - Có `active_voucher` đang tính giá → bắt buộc đồng bộ nhãn theo voucher đó (mọi scope).
 * - Không có → chỉ cho phép voucher toàn shop active.
 *
 * @param {string | null | undefined} code
 * @param {ReturnType<typeof serializeEligibleVoucherForPicker>[]} eligibleShopWide
 * @param {object | null | undefined} [appliedActive] — `active_voucher` từ API
 */
export function sanitizeProductVoucherForSave(code, eligibleShopWide = [], appliedActive = null) {
  if (appliedActive?.code?.trim()) {
    const appliedOption = appliedVoucherToPickerOption(appliedActive);
    if (!appliedOption) {
      return { error: 'Voucher đang áp dụng không hợp lệ' };
    }

    const trimmed = code?.trim();
    if (trimmed && trimmed.toUpperCase() !== appliedActive.code.trim().toUpperCase()) {
      return {
        error: 'Nhãn voucher phải trùng voucher đang áp dụng vào giá. Voucher theo SKU quản lý tại mục Voucher.',
      };
    }

    return { product_voucher: eligibleVoucherToProductVoucher(appliedOption) };
  }

  return sanitizeProductVoucherSelection(code, eligibleShopWide);
}

/**
 * Nhãn option trong select form SP.
 * @param {ReturnType<typeof serializeEligibleVoucherForPicker>} voucher
 */
export function formatEligibleVoucherOptionLabel(voucher) {
  const minOrder =
    voucher.minOrder > 0
      ? ` · đơn từ ${voucher.minOrder.toLocaleString('vi-VN')}đ`
      : '';
  return `${voucher.code} · ${voucher.name} (${voucher.valueLabel}${minOrder})`;
}
