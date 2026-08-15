/**
 * Ingredient / kho nguyên liệu — module RBAC: ingredient.
 *
 * Base path: /ingvedient (giữ typo backend)
 *
 * AUTH:
 *   GET    /ingvedient/list           — danh sách (page, limit, filter JSON)
 *   GET    /ingvedient/detail         — chi tiết (?id= | ?name=)
 *   POST   /ingvedient/addstock        — nhập kho / tạo mới (upsert theo tên)
 *   PUT    /ingvedient/update-info/:id — cập nhật tên, đơn vị, vị trí
 *   DELETE /ingvedient/remove/:id      — xóa nguyên liệu
 */

import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

/**
 * @param {Record<string, unknown>} params
 */
function buildQuery(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      p.set(k, String(v));
    }
  }
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

import { LOW_STOCK_THRESHOLD } from '@/lib/ingredients/ingredientDisplay';

/**
 * @param {{ search?: string, location?: string, stock?: string }} [filters]
 */
export function buildIngredientApiFilter(filters = {}) {
  /** @type {Record<string, unknown>[]} */
  const clauses = [];
  const search = filters.search?.trim().toLowerCase();
  const location = filters.location?.trim();

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    clauses.push({
      $or: [
        { ingredient_name: { $regex: escaped, $options: 'i' } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: escaped,
              options: 'i',
            },
          },
        },
      ],
    });
  }
  if (location) {
    clauses.push({ ingredient_location: location });
  }
  if (filters.stock === 'out') {
    clauses.push({ ingredient_stock: { $lte: 0 } });
  } else if (filters.stock === 'low') {
    clauses.push({ ingredient_stock: { $gt: 0, $lt: LOW_STOCK_THRESHOLD } });
  } else if (filters.stock === 'ok') {
    clauses.push({ ingredient_stock: { $gte: LOW_STOCK_THRESHOLD } });
  }

  if (!clauses.length) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

/**
 * Danh sách nguyên liệu — phân trang server.
 * @param {{ page?: number, limit?: number, search?: string, location?: string, stock?: string }} [params]
 */
export async function getIngredients(params = {}) {
  const filter = buildIngredientApiFilter({
    search: params.search,
    location: params.location,
    stock: params.stock,
  });

  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIST_LIMIT,
    ...(Object.keys(filter).length > 0 ? { filter: JSON.stringify(filter) } : {}),
  });

  const raw = await apiGet(`/ingvedient/list${query}`, {
    tags: ['ingredients'],
    revalidate: 0,
  });

  const meta = raw?.metadata ?? raw;
  const items = meta?.data ?? [];
  const total = meta?.total ?? items.length;
  const page = meta?.page ?? params.page ?? 1;
  const limit = meta?.limit ?? params.limit ?? DEFAULT_LIST_LIMIT;

  return {
    items,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

/** Thống kê mức tồn kho (all / ok / low / out) */
export async function getIngredientStats() {
  const raw = await apiGet('/ingvedient/stats', {
    tags: ['ingredients', 'ingredient-stats'],
    revalidate: 0,
  });
  return raw?.metadata ?? raw ?? {};
}

/**
 * Chi tiết nguyên liệu (kèm lịch sử nhập).
 * @param {{ id?: string, name?: string }} params
 */
export async function getIngredientById(id) {
  const raw = await apiGet(`/ingvedient/detail?id=${encodeURIComponent(id)}`, {
    tags: [`ingredient-${id}`],
    revalidate: 0,
  });
  return raw?.metadata ?? raw;
}

/** @param {object} body */
export async function addIngredientStock(body) {
  const raw = await apiPost('/ingvedient/addstock', body);
  return raw?.metadata ?? raw;
}

/**
 * @param {string} id
 * @param {{ name?: string, unit?: string, location?: string }} body
 */
export async function updateIngredientInfo(id, body) {
  const raw = await apiPut(`/ingvedient/update-info/${id}`, body);
  return raw?.metadata ?? raw;
}

/** @param {string} id */
export async function deleteIngredient(id) {
  const raw = await apiDelete(`/ingvedient/remove/${id}`);
  return raw?.metadata ?? raw;
}
