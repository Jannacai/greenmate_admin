import { z } from 'zod';

const UNITS = ['g', 'ml', 'cái'];

export const ingredientStockSchema = z.object({
  ingredientName: z.string().trim().min(2, 'Tên nguyên liệu tối thiểu 2 ký tự'),
  stock: z.coerce.number().positive('Số lượng nhập phải lớn hơn 0'),
  unit: z.enum(UNITS, { message: 'Chọn đơn vị tính' }),
  cost: z.coerce.number().min(0, 'Giá vốn không được âm').default(0),
  location: z.string().trim().min(1, 'Nhập vị trí kho').default('Kho chính'),
});

export const ingredientInfoSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự'),
  unit: z.enum(UNITS, { message: 'Chọn đơn vị tính' }),
  location: z.string().trim().min(1, 'Nhập vị trí kho'),
});

/**
 * @param {z.SafeParseReturnType<any, any>} result
 */
export function formatIngredientSchemaError(result) {
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
 * @param {z.infer<typeof ingredientStockSchema>} data
 */
export function toAddStockApiBody(data) {
  return {
    ingredientName: data.ingredientName,
    stock: data.stock,
    unit: data.unit,
    cost: data.cost,
    location: data.location,
  };
}

/**
 * @param {z.infer<typeof ingredientInfoSchema>} data
 */
export function toUpdateInfoApiBody(data) {
  return {
    name: data.name,
    unit: data.unit,
    location: data.location,
  };
}

export { UNITS as INGREDIENT_UNITS };
