export const CATEGORY_STATUS_CONFIG = {
  active: {
    label: 'Đang hiển thị',
    dot: 'bg-green-600',
    className: 'bg-green-100 text-green-900 ring-green-300',
  },
  inactive: {
    label: 'Đã ẩn',
    dot: 'bg-amber-500',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
};

/**
 * @param {object} category
 */
export function getCategoryStorefrontPath(category) {
  const slug = category?.category_slug;
  return slug && category?.category_level === 2 ? `/danh-muc/${slug}` : '';
}

/**
 * @param {string} productType
 */
export function getProductTypeLabel(productType) {
  const map = {
    dryseed: 'Hạt dinh dưỡng',
    milkseed: 'Sữa hạt organic',
    combo: 'Combo',
  };
  return map[productType] ?? productType;
}
