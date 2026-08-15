import { z } from 'zod';

const APPLIES_TO = ['all', 'specific'];
const DISCOUNT_TYPES = ['percentage', 'fixed_amount'];

export const voucherSchema = z
  .object({
    name: z.string().trim().min(2, 'Tên voucher tối thiểu 2 ký tự'),
    description: z.string().trim().min(2, 'Mô tả tối thiểu 2 ký tự'),
    code: z
      .string()
      .trim()
      .min(3, 'Mã voucher tối thiểu 3 ký tự')
      .max(32, 'Mã voucher tối đa 32 ký tự')
      .regex(/^[A-Za-z0-9_-]+$/, 'Mã chỉ gồm chữ, số, gạch ngang và gạch dưới'),
    type: z.enum(DISCOUNT_TYPES),
    value: z.coerce.number().positive('Giá trị giảm phải lớn hơn 0'),
    start_date: z.string().min(1, 'Chọn ngày bắt đầu'),
    end_date: z.string().min(1, 'Chọn ngày kết thúc'),
    is_active: z.coerce.boolean().default(true),
    max_uses: z.coerce.number().int().min(1, 'Số lượt dùng tối thiểu là 1'),
    max_uses_per_user: z.coerce.number().int().min(1, 'Lượt dùng/khách tối thiểu là 1'),
    min_order_value: z.coerce.number().min(0, 'Giá trị đơn tối thiểu không âm').default(0),
    applies_to: z.enum(APPLIES_TO),
    product_ids: z.array(z.string()).default([]),
    sku_ids: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({ code: 'custom', message: 'Ngày không hợp lệ', path: ['start_date'] });
      return;
    }
    if (start >= end) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
        path: ['end_date'],
      });
    }
    if (data.type === 'percentage' && data.value > 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'Phần trăm giảm không được vượt quá 100%',
        path: ['value'],
      });
    }
    if (data.applies_to === 'specific' && data.product_ids.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Chọn ít nhất một sản phẩm',
        path: ['product_ids'],
      });
    }
  });

/**
 * @param {z.SafeParseReturnType<any, any>} result
 * @returns {{ fieldErrors?: Record<string, string[]>, error?: string } | null}
 */
export function formatVoucherSchemaError(result) {
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
 * Map form → API body.
 * @param {z.infer<typeof voucherSchema>} data
 */
export function toDiscountApiBody(data) {
  return {
    name: data.name,
    description: data.description,
    code: data.code.toUpperCase(),
    type: data.type,
    value: data.value,
    start_date: new Date(data.start_date).toISOString(),
    end_date: new Date(data.end_date).toISOString(),
    is_active: data.is_active,
    max_uses: data.max_uses,
    max_uses_per_user: data.max_uses_per_user,
    min_order_value: data.min_order_value,
    applies_to: data.applies_to,
    product_ids: data.applies_to === 'specific' ? data.product_ids : [],
    sku_ids: [],
  };
}

/**
 * @param {object} discount
 * @returns {'active'|'inactive'|'expired'|'scheduled'}
 */
export function getVoucherLifecycleStatus(discount) {
  const fromApi = discount?.lifecycle_status;
  if (fromApi === 'active' || fromApi === 'inactive' || fromApi === 'expired' || fromApi === 'scheduled') {
    return fromApi;
  }

  const now = Date.now();
  const end = new Date(discount.discount_end_date).getTime();
  if (!Number.isNaN(end) && end < now) return 'expired';
  if (!discount?.discount_is_active) return 'inactive';
  const start = new Date(discount.discount_start_date).getTime();
  if (!Number.isNaN(start) && start > now) return 'scheduled';
  return 'active';
}
