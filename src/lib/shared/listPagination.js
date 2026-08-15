/** Kích thước trang chuẩn — khớp `ListPagination` UI. */
export const LIST_PAGE_SIZE_OPTIONS = [10, 20, 50];

export const DEFAULT_LIST_LIMIT = 10;

/** Phân trang danh sách sản phẩm áp dụng voucher (chi tiết voucher). */
export const DEFAULT_SCOPE_LIST_LIMIT = 10;

/**
 * @param {string | undefined} value
 */
export function parseScopeListLimit(value) {
  const n = Number(value);
  if (n === 10 || n === 20 || n === 50) return n;
  return DEFAULT_SCOPE_LIST_LIMIT;
}

/**
 * @param {string | undefined} value
 */
export function parseScopeListPage(value) {
  return parseListPage(value);
}

/**
 * @param {string | undefined} value
 */
export function parseListLimit(value) {
  void value;
  return DEFAULT_LIST_LIMIT;
}

/**
 * @param {string | undefined} value
 */
export function parseListPage(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

/**
 * Cắt mảng theo page/limit — dùng khi API chưa hỗ trợ phân trang server-side.
 * @template T
 * @param {T[]} items
 * @param {number} page
 * @param {number} limit
 */
export function paginateList(items, page, limit) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    total,
    page: safePage,
    limit,
    totalPages,
  };
}
