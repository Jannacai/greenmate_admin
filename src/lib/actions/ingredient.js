'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/assertPermission';
import {
  addIngredientStock,
  deleteIngredient,
  getIngredientById,
  getIngredients,
  updateIngredientInfo,
} from '@/lib/api/ingredient';
import {
  formatIngredientSchemaError,
  ingredientInfoSchema,
  ingredientStockSchema,
  toAddStockApiBody,
  toUpdateInfoApiBody,
} from '@/lib/ingredients/ingredientSchema';
import { mapIngredientsToPickerOptions, mapIngredientToPickerOption } from '@/lib/ingredients/ingredientDisplay';
import { mutationErrorMessage } from '@/lib/shared/actionError';

function revalidateIngredients(ingredientId) {
  updateTag('ingredients');
  if (ingredientId) updateTag(`ingredient-${ingredientId}`);
  revalidatePath('/inventory');
}

/**
 * Danh sách nguyên liệu cho picker recipe — search server.
 * @param {{ search?: string, limit?: number, page?: number }} [params]
 */
export async function searchIngredientsForPickerAction(params = {}) {
  const denied = await requirePermission('read:any', 'ingredient');
  if (denied) return { error: denied.error, items: [] };

  try {
    const data = await getIngredients({
      search: params.search,
      limit: params.limit ?? 20,
      page: params.page ?? 1,
    });

    let items = mapIngredientsToPickerOptions(data.items);

    const q = params.search?.trim();
    if (!items.length && q && /^[a-f0-9]{24}$/i.test(q)) {
      try {
        const row = await getIngredientById(q);
        if (row) items = [mapIngredientToPickerOption(row)];
      } catch {
        /* không tìm thấy theo ID */
      }
    }

    return { items };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không tải được danh sách nguyên liệu'), items: [] };
  }
}

/**
 * Tải nguyên liệu đã chọn trong recipe (khi sửa SP).
 * @param {{ ids?: string[] }} params
 */
export async function getIngredientsForPickerByIdsAction({ ids = [] } = {}) {
  const denied = await requirePermission('read:any', 'ingredient');
  if (denied) return denied;

  const unique = [...new Set((ids || []).map(String).filter(Boolean))];
  if (!unique.length) return { items: [] };

  try {
    const rows = await Promise.all(
      unique.map(async (id) => {
        try {
          return await getIngredientById(id);
        } catch {
          return null;
        }
      }),
    );
    const items = rows
      .filter(Boolean)
      .map((row) => mapIngredientToPickerOption(row));
    return { items };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Không tải được nguyên liệu đã chọn'), items: [] };
  }
}

/**
 * @param {object} payload
 */
export async function addIngredientStockAction(payload) {
  const denied = await requirePermission('create:any', 'ingredient');
  if (denied) return denied;

  const parsed = ingredientStockSchema.safeParse(payload);
  const validationError = formatIngredientSchemaError(parsed);
  if (validationError) return validationError;

  try {
    const result = await addIngredientStock(toAddStockApiBody(parsed.data));
    const id = result?._id?.toString?.() ?? result?._id;
    revalidateIngredients(id);
    return { success: true, id, message: 'Đã nhập kho nguyên liệu' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Nhập kho thất bại') };
  }
}

/**
 * @param {string} ingredientId
 * @param {object} payload
 */
export async function updateIngredientInfoAction(ingredientId, payload) {
  if (!ingredientId) return { error: 'Thiếu ID nguyên liệu' };

  const denied = await requirePermission('update:any', 'ingredient');
  if (denied) return denied;

  const parsed = ingredientInfoSchema.safeParse(payload);
  const validationError = formatIngredientSchemaError(parsed);
  if (validationError) return validationError;

  try {
    await updateIngredientInfo(ingredientId, toUpdateInfoApiBody(parsed.data));
    revalidateIngredients(ingredientId);
    return { success: true, message: 'Đã cập nhật thông tin nguyên liệu' };
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Cập nhật thất bại') };
  }
}

/**
 * @param {string} ingredientId
 */
export async function deleteIngredientAction(ingredientId) {
  if (!ingredientId) return { error: 'Thiếu ID nguyên liệu' };

  const denied = await requirePermission('delete:any', 'ingredient');
  if (denied) return denied;

  try {
    await deleteIngredient(ingredientId);
    revalidateIngredients(ingredientId);
    redirect('/inventory?toast=deleted');
  } catch (err) {
    return { error: mutationErrorMessage(err, 'Xóa nguyên liệu thất bại') };
  }
}
