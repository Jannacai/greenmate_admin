/**
 * Schema Zod validate payload sản phẩm — dùng chung Server Actions.
 * Client form có schema riêng (UX); server luôn validate lại trước khi gọi API.
 */


import { z } from 'zod';
import { productInfoAttributesSchema } from '@/lib/products/productInfoAttributes';

/** URL media http(s) — ảnh hoặc video Cloudinary */
export const mediaUrlSchema = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\/.+/i.test(v), {
    message: 'URL phải bắt đầu bằng http:// hoặc https://',
  });

/** URL ảnh http(s) — cho phép chuỗi rỗng */
export const imageUrlSchema = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\/.+/i.test(v), {
    message: 'URL ảnh phải bắt đầu bằng http:// hoặc https://',
  });

const variationSchema = z.object({
  name: z.string().trim().min(1, 'Tên phân loại không được trống'),
  options: z
    .array(z.string().trim().min(1, 'Lựa chọn không được trống'))
    .min(1, 'Mỗi phân loại cần ít nhất 1 lựa chọn'),
  colors: z.array(z.string()).optional(),
});

const skuRecipeItemSchema = z.object({
  ingredient_id: z.string().trim().min(1, 'Chọn nguyên liệu'),
  weight_needed: z.coerce.number().positive('Định lượng phải lớn hơn 0'),
});

const skuSchema = z.object({
  sku_code: z.string().trim().min(1, 'Mã SKU không được trống'),
  sku_tier_idx: z.array(z.coerce.number().int().min(0)),
  sku_price: z.coerce.number().min(1000, 'Giá SKU tối thiểu 1.000đ'),
  sku_price_sale: z.coerce.number().min(0).optional(),
  sku_stock: z.coerce.number().int().min(0, 'Tồn kho không được âm'),
  is_default: z.boolean().optional(),
  sku_images: z.array(imageUrlSchema).max(30).optional(),
  sku_videos: z.array(mediaUrlSchema).max(1).optional(),
  sku_recipe: z
    .array(skuRecipeItemSchema)
    .min(1, 'Mỗi SKU cần ít nhất một nguyên liệu'),
  sku_volume: z.coerce.number().positive('Dung tích phải lớn hơn 0').optional(),
});

const productBaseFields = {
  product_name: z.string().trim().min(3, 'Tên tối thiểu 3 ký tự').max(200),
  product_code: z
    .string()
    .trim()
    .min(4, 'Mã sản phẩm tối thiểu 4 ký tự')
    .max(16, 'Mã sản phẩm tối đa 16 ký tự')
    .regex(/^[A-Z0-9-]+$/i, 'Mã chỉ gồm chữ, số và dấu gạch ngang'),
  product_price: z.coerce.number().min(1000, 'Giá tối thiểu 1.000đ'),
  product_descriptions: z.string().max(10000).optional().nullable(),
  product_thumb: imageUrlSchema.optional(),
  product_shop: z.string().optional(),
  product_attributes: productInfoAttributesSchema,
  product_badge: z
    .object({
      badge_type: z.string(),
      text: z.string().optional(),
    })
    .optional(),
  product_voucher: z
    .object({
      code: z.string().nullable().optional(),
      desc: z.string().nullable().optional(),
      text: z.string().nullable().optional(),
    })
    .optional(),
  /** Danh mục cấp 2 — ObjectId string hoặc null khi bỏ chọn */
  product_category_id: z.union([z.string().trim().min(1), z.null()]).optional(),
  product_variations: z.array(variationSchema).max(12),
  product_skus: z.array(skuSchema).min(1, 'Cần ít nhất 1 SKU'),
};

/** Tạo mới — dryseed / milkseed */
export const createProductPayloadSchema = z
  .object({
    ...productBaseFields,
    product_type: z.enum(['dryseed', 'milkseed'], {
      message: 'Loại sản phẩm không hợp lệ',
    }),
  })
  .superRefine(refineSkusAndVariations);

/** Cập nhật — thêm combo (SP cũ có thể là combo) */
export const updateProductPayloadSchema = z
  .object({
    ...productBaseFields,
    product_type: z.enum(['dryseed', 'milkseed', 'combo'], {
      message: 'Loại sản phẩm không hợp lệ',
    }),
  })
  .superRefine(refineSkusAndVariations);

/**
 * @param {import('zod').SafeParseReturnType<any, any>} result
 * @returns {{ fieldErrors?: Record<string, string[]>, error?: string } | null}
 */
export function formatProductSchemaError(result) {
  if (result.success) return null;

  const flat = result.error.flatten();
  const formMsg = flat.formErrors?.[0];
  const fieldEntries = Object.entries(flat.fieldErrors ?? {});
  const firstFieldMsg = fieldEntries.find(([, msgs]) => msgs?.length)?.[1]?.[0];

  return {
    fieldErrors: flat.fieldErrors,
    error: formMsg ?? firstFieldMsg ?? 'Dữ liệu sản phẩm không hợp lệ',
  };
}

/**
 * @param {object} data
 * @param {{ mode?: 'create' | 'update' }} [opts]
 */
export function validateProductPayload(data, opts = {}) {
  const schema =
    opts.mode === 'update' ? updateProductPayloadSchema : createProductPayloadSchema;
  return schema.safeParse(data);
}

/** @param {object} data @param {import('zod').RefinementCtx} ctx */
function refineSkusAndVariations(data, ctx) {
  const variations = data.product_variations ?? [];
  const skus = data.product_skus ?? [];

  const namedVariations = variations.filter((v) => v.name?.trim());
  if (namedVariations.length > 0) {
    const expectedComboCount = namedVariations.reduce(
      (acc, v) => acc * v.options.length,
      1,
    );
    if (skus.length !== expectedComboCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Số SKU (${skus.length}) không khớp với ma trận phân loại (${expectedComboCount})`,
        path: ['product_skus'],
      });
    }
  }

  const defaultCount = skus.filter((s) => s.is_default).length;
  if (defaultCount > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Chỉ được chọn một SKU mặc định',
      path: ['product_skus'],
    });
  }

  skus.forEach((sku, i) => {
    const sale = sku.sku_price_sale ?? sku.sku_price;
    if (sale > 0 && sale < sku.sku_price) {
      /* giá sale thấp hơn giá gốc — hợp lệ */
    }
    if (sku.sku_price_sale != null && sku.sku_price_sale > sku.sku_price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Giá khuyến mãi không được cao hơn giá bán',
        path: ['product_skus', i, 'sku_price_sale'],
      });
    }

    (sku.sku_images ?? []).forEach((url, j) => {
      if (url && !/^https?:\/\/.+/i.test(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'URL ảnh SKU không hợp lệ',
          path: ['product_skus', i, 'sku_images', j],
        });
      }
    });

    (sku.sku_videos ?? []).forEach((url, j) => {
      if (url && !/^https?:\/\/.+/i.test(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'URL video SKU không hợp lệ',
          path: ['product_skus', i, 'sku_videos', j],
        });
      }
    });
  });

  if (data.product_thumb && !/^https?:\/\/.+/i.test(data.product_thumb)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'URL ảnh đại diện không hợp lệ',
      path: ['product_thumb'],
    });
  }
}
