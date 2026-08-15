import { formatCurrency, formatDate, stringifyMongoId } from '@/lib/shared/utils';

/** Ngưỡng cảnh báo tồn kho thấp (gram / ml) */
export const LOW_STOCK_THRESHOLD = 1000;

/** Hệ số quy đổi gam ↔ kg — DB lưu gram, UI nhập/hiển thị kg */
export const GRAMS_PER_KG = 1000;

/**
 * Đơn vị khối lượng lưu nội bộ theo gam.
 * @param {string} [unit]
 */
export function isWeightGramUnit(unit) {
  return unit === 'g';
}

/**
 * Nhãn đơn vị hiển thị trên UI.
 * @param {string} [unit]
 */
export function ingredientDisplayUnit(unit = 'g') {
  return isWeightGramUnit(unit) ? 'kg' : unit || 'g';
}

/**
 * Số lượng form (kg) → gram gửi API.
 * @param {number} stock
 * @param {string} unit
 */
export function stockInputToGrams(stock, unit) {
  const qty = Number(stock) || 0;
  return isWeightGramUnit(unit) ? qty * GRAMS_PER_KG : qty;
}

/**
 * Giá vốn form (VND/kg) → VND/g gửi API.
 * @param {number} cost
 * @param {string} unit
 */
export function costInputToPerBaseUnit(cost, unit) {
  const price = Number(cost) || 0;
  return isWeightGramUnit(unit) ? price / GRAMS_PER_KG : price;
}

/**
 * Hiển thị tên nguyên liệu (DB lưu lowercase).
 * @param {string} [name]
 */
export function formatIngredientName(name) {
  if (!name?.trim()) return '—';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * @param {number} stock
 */
export function getIngredientStockStatus(stock = 0) {
  const qty = Number(stock) || 0;
  if (qty <= 0) {
    return {
      key: 'out',
      label: 'Hết hàng',
      dot: 'bg-red-500',
      text: 'text-red-700',
      className: 'bg-red-50 text-red-700 ring-red-200',
    };
  }
  if (qty < LOW_STOCK_THRESHOLD) {
    return {
      key: 'low',
      label: 'Sắp hết',
      dot: 'bg-amber-500',
      text: 'text-amber-800',
      className: 'bg-amber-50 text-amber-800 ring-amber-200',
    };
  }
  return {
    key: 'ok',
    label: 'Còn hàng',
    dot: 'bg-green-500',
    text: 'text-green-700',
    className: 'bg-green-50 text-green-700 ring-green-200',
  };
}

/**
 * @param {number} stock
 * @param {string} [unit]
 */
export function formatIngredientQuantity(stock, unit = 'g') {
  const qty = Number(stock) || 0;
  if (isWeightGramUnit(unit)) {
    const kg = qty / GRAMS_PER_KG;
    const formatted = Number.isInteger(kg)
      ? kg.toLocaleString('vi-VN')
      : kg.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
    return `${formatted} kg`;
  }
  return `${qty.toLocaleString('vi-VN')} ${unit || 'g'}`;
}

/**
 * Option cho picker recipe sản phẩm.
 * @param {object} ingredient
 */
export function mapIngredientToPickerOption(ingredient) {
  const meta = getIngredientListMeta(ingredient);
  return {
    id: meta.id,
    name: meta.name,
    unit: ingredientDisplayUnit(meta.unit),
    stockLabel: meta.stockLabel,
  };
}

/**
 * @param {object[]} ingredients
 */
export function mapIngredientsToPickerOptions(ingredients = []) {
  return ingredients.map(mapIngredientToPickerOption);
}

/**
 * Meta hiển thị trên dòng danh sách.
 * @param {object} ingredient
 */
export function getIngredientListMeta(ingredient) {
  const id = stringifyMongoId(ingredient._id);
  const stock = Number(ingredient.ingredient_stock ?? 0);
  const unit = ingredient.ingredient_unit ?? 'g';
  const cost = Number(ingredient.ingredient_cost ?? 0);
  const stockStatus = getIngredientStockStatus(stock);

  return {
    id,
    name: formatIngredientName(ingredient.ingredient_name),
    rawName: ingredient.ingredient_name ?? '',
    stock,
    unit,
    stockLabel: formatIngredientQuantity(stock, unit),
    cost,
    costLabel: cost > 0
      ? (isWeightGramUnit(unit)
        ? `${formatCurrency(cost * GRAMS_PER_KG)}/kg`
        : `${formatCurrency(cost)}/${unit}`)
      : '—',
    location: ingredient.ingredient_location?.trim() || '—',
    stockStatus,
    updatedAt: ingredient.updatedAt ?? null,
    updatedLabel: ingredient.updatedAt ? formatDate(ingredient.updatedAt, 'datetime') : '—',
  };
}

/**
 * @param {object[]} ingredients
 */
export function countIngredientStockStatuses(ingredients = []) {
  let ok = 0;
  let low = 0;
  let out = 0;

  for (const item of ingredients) {
    const status = getIngredientStockStatus(item.ingredient_stock).key;
    if (status === 'ok') ok += 1;
    else if (status === 'low') low += 1;
    else out += 1;
  }

  return { ok, low, out };
}
