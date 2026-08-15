import { z } from 'zod';

export const CATEGORY_L2_PRODUCT_TYPE_OPTIONS = [
  { value: 'dryseed', label: 'Hạt dinh dưỡng' },
  { value: 'milkseed', label: 'Sữa hạt organic' },
];

/** @deprecated — dùng CATEGORY_L2_PRODUCT_TYPE_OPTIONS trên form admin */
export const CATEGORY_PRODUCT_TYPE_OPTIONS = [
  ...CATEGORY_L2_PRODUCT_TYPE_OPTIONS,
  { value: 'combo', label: 'Combo' },
];

/**
 * @param {object} category
 */
export function getCategoryLifecycleStatus(category) {
  return category?.category_is_active ? 'active' : 'inactive';
}

/** Form admin — chỉ tạo/sửa loại sản phẩm (L2) */
export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(120),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/i, 'Slug chỉ gồm chữ, số và dấu gạch ngang')
    .optional()
    .or(z.literal('')),
  description: z.string().max(2000).optional().default(''),
  image: z.string().max(2000).optional().default(''),
  product_type: z.enum(['dryseed', 'milkseed'], {
    message: 'Chọn nhóm sản phẩm',
  }),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(false),
});

/** @deprecated — giữ cho tương thích nội bộ */
export const categorySchema = categoryFormSchema;

/**
 * @param {z.SafeParseReturnType<any, any>} result
 */
export function formatCategorySchemaError(result) {
  if (result.success) return null;

  /** @type {Record<string, string[]>} */
  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = [issue.message];
    }
  }
  return { fieldErrors };
}

/**
 * @param {import('zod').infer<typeof categorySchema>} data
 */
export function toCategoryApiBody(data) {
  return {
    category_name: data.name,
    category_slug: data.slug || undefined,
    category_description: data.description ?? '',
    category_image: data.image ?? '',
    category_level: 2,
    category_product_type: data.product_type,
    category_sort_order: data.sort_order ?? 0,
    category_is_active: data.is_active ?? false,
  };
}
