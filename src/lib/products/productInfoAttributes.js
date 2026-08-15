/**
 * Trường mô tả chi tiết SP — dùng chung mọi product_type, lưu trong product_attributes.
 * Single source of truth cho form admin, Zod schema và mapper payload.
 */

import { z } from 'zod';

/** @typedef {{ key: string, label: string, placeholder: string, rows?: number }} ProductInfoFieldDef */

/** @type {ProductInfoFieldDef[]} */
export const PRODUCT_DETAIL_ATTRIBUTE_FIELDS = [
  {
    key: 'storage',
    label: 'Bảo quản',
    placeholder: 'VD: Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp…',
    rows: 3,
  },
  {
    key: 'usage_instructions',
    label: 'Hướng dẫn sử dụng',
    placeholder: 'VD: Dùng trực tiếp hoặc rang nhẹ trước khi thưởng thức…',
    rows: 3,
  },
  {
    key: 'ingredients',
    label: 'Thành phần',
    placeholder: 'VD: Hạt điều 100%, muối biển…',
    rows: 3,
  },
  {
    key: 'benefits',
    label: 'Công dụng',
    placeholder: 'VD: Bổ sung chất xơ, protein thực vật…',
    rows: 3,
  },
  {
    key: 'nutritional_info',
    label: 'Thông tin dinh dưỡng',
    placeholder: 'VD: Năng lượng, protein, chất béo trên 100g…',
    rows: 4,
  },
  {
    key: 'safety_warning',
    label: 'Cảnh báo an toàn',
    placeholder: 'VD: Có thể chứa dị nguyên hạt, không dùng cho trẻ dưới 3 tuổi…',
    rows: 3,
  },
  {
    key: 'green_message',
    label: 'Thông điệp xanh',
    placeholder: 'VD: Cam kết nguồn gốc bền vững, bao bì tái chế…',
    rows: 3,
  },
  {
    key: 'quality_commitment',
    label: 'Cam kết chất lượng',
    placeholder: 'VD: 100% nguyên chất, không chất bảo quản…',
    rows: 3,
  },
  {
    key: 'return_policy',
    label: 'Đổi trả',
    placeholder: 'VD: Đổi trả trong 7 ngày nếu sản phẩm lỗi do vận chuyển…',
    rows: 3,
  },
];

export const PRODUCT_INFO_ATTRIBUTE_KEYS = [
  'brand',
  'origin',
  ...PRODUCT_DETAIL_ATTRIBUTE_FIELDS.map((f) => f.key),
];

const optionalTextField = z.string().max(5000).optional();

/** Schema Zod cho product_attributes — tất cả trường optional. */
export const productInfoAttributesSchema = z
  .object({
    brand: optionalTextField,
    origin: optionalTextField,
    storage: optionalTextField,
    usage_instructions: optionalTextField,
    ingredients: optionalTextField,
    benefits: optionalTextField,
    nutritional_info: optionalTextField,
    safety_warning: optionalTextField,
    green_message: optionalTextField,
    quality_commitment: optionalTextField,
    return_policy: optionalTextField,
    /** Combo — giữ khi validate update */
    items: z.array(z.unknown()).optional(),
  })
  .optional();

/** Giá trị mặc định form — mọi key info attribute là chuỗi rỗng. */
export const PRODUCT_INFO_FORM_DEFAULTS = Object.fromEntries(
  PRODUCT_INFO_ATTRIBUTE_KEYS.map((key) => [key, '']),
);

/**
 * Map product_attributes API → flat form values.
 * @param {object} [attrs]
 * @returns {Record<string, string>}
 */
export function mapProductInfoAttributesToForm(attrs = {}) {
  return Object.fromEntries(
    PRODUCT_INFO_ATTRIBUTE_KEYS.map((key) => [key, attrs[key] ?? '']),
  );
}

/**
 * Build object product_attributes từ form values — chỉ gửi field có nội dung.
 * @param {Record<string, string | undefined>} values
 * @returns {Record<string, string>}
 */
export function buildProductInfoAttributesPayload(values = {}) {
  const payload = {};

  for (const key of PRODUCT_INFO_ATTRIBUTE_KEYS) {
    const raw = values[key];
    if (raw == null) continue;
    const trimmed = String(raw).trim();
    if (trimmed) payload[key] = trimmed;
  }

  return payload;
}

/**
 * Giữ field đặc thù product_type (vd. combo.items) khi admin cập nhật qua form chung.
 * @param {Record<string, string>} infoPayload
 * @param {object} [existingAttrs]
 * @returns {Record<string, unknown>}
 */
export function mergeProductInfoAttributesForSave(infoPayload, existingAttrs = {}) {
  const merged = { ...infoPayload };

  if (Array.isArray(existingAttrs.items) && existingAttrs.items.length > 0) {
    merged.items = existingAttrs.items;
  }

  return merged;
}

/**
 * Lấy các mục có nội dung để hiển thị preview/detail.
 * @param {object} [attrs]
 * @returns {{ key: string, label: string, value: string }[]}
 */
export function listFilledProductInfoSections(attrs = {}) {
  const labelByKey = Object.fromEntries(
    PRODUCT_DETAIL_ATTRIBUTE_FIELDS.map((f) => [f.key, f.label]),
  );
  labelByKey.brand = 'Thương hiệu';
  labelByKey.origin = 'Xuất xứ';

  return PRODUCT_INFO_ATTRIBUTE_KEYS
    .filter((key) => String(attrs[key] ?? '').trim())
    .map((key) => ({
      key,
      label: labelByKey[key] ?? key,
      value: String(attrs[key]).trim(),
    }));
}
