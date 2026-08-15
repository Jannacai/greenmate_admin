/** @typedef {'all' | 'specific' | 'specific_sku'} AppliesTo */

/**
 * Nhãn phạm vi voucher — file tách riêng để client component import
 * không kéo theo chuỗi voucherDisplay → productPreview (circular).
 */
export const APPLIES_TO_CONFIG = {
  all: {
    label: 'Toàn shop',
    shortLabel: 'Toàn shop',
    className: 'bg-slate-50 text-slate-700 ring-slate-200',
  },
  specific: {
    label: 'Sản phẩm cụ thể',
    shortLabel: 'Sản phẩm',
    className: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
  specific_sku: {
    label: 'Biến thể SKU',
    shortLabel: 'SKU',
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
};
