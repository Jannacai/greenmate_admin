import { parseListLimit, parseListPage } from '@/lib/shared/listPagination';

export const PRODUCT_TYPE_LABELS = {
  dryseed: 'Hạt khô',
  milkseed: 'Sữa hạt',
  combo: 'Combo',
};

/** Sort mặc định tab Tất cả: đang bán trước, nháp sau. */
export const PRODUCT_LIST_DEFAULT_SORT_ALL = 'lifecycle_asc';
export const PRODUCT_LIST_DEFAULT_SORT_FILTERED = 'updated_desc';

/** @param {string | undefined} status */
export function getDefaultProductListSort(status) {
  return status ? PRODUCT_LIST_DEFAULT_SORT_FILTERED : PRODUCT_LIST_DEFAULT_SORT_ALL;
}

/** @param {string | undefined} value */
export const parseProductLimit = parseListLimit;

/** @param {string | undefined} value */
export const parseProductPage = parseListPage;

/**
 * @param {Record<string, string | undefined>} params
 */
export function buildProductFilterQuery(params) {
  const qs = new URLSearchParams();
  for (const key of ['status', 'type', 'search', 'voucher', 'voucher_applied', 'sort', 'page', 'limit']) {
    if (params[key]) qs.set(key, params[key]);
  }
  return qs.toString();
}

/**
 * @param {Record<string, string | undefined>} params
 */
export function hasActiveProductFilters(params = {}) {
  const defaultSort = getDefaultProductListSort(params.status);
  return Boolean(
    params.status ||
    params.type ||
    params.search?.trim() ||
    params.voucher?.trim() ||
    params.voucher_applied === 'yes' ||
    params.voucher_applied === 'no' ||
    (params.sort && params.sort !== defaultSort),
  );
}
