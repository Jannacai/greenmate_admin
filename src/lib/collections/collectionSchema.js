import { z } from 'zod';

/**
 * @param {object} collection
 */
export function getCollectionLifecycleStatus(collection) {
  return collection?.collection_is_active ? 'active' : 'inactive';
}

export const collectionSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(120),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/i, 'Slug chỉ gồm chữ, số và dấu gạch ngang')
    .optional()
    .or(z.literal('')),
  description: z.string().max(2000).optional().default(''),
  product_ids: z.array(z.string()).min(1, 'Chọn ít nhất một sản phẩm'),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(false),
});

/**
 * @param {z.SafeParseReturnType<any, any>} result
 */
export function formatCollectionSchemaError(result) {
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
 * @param {import('zod').infer<typeof collectionSchema>} data
 */
export function toCollectionApiBody(data) {
  return {
    name: data.name,
    slug: data.slug || undefined,
    description: data.description ?? '',
    product_ids: data.product_ids,
    sort_order: data.sort_order ?? 0,
    is_active: data.is_active ?? false,
  };
}
