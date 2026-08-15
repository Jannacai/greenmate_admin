import { DEFAULT_LIST_LIMIT, parseListLimit, parseListPage } from '@/lib/shared/listPagination';

export const RBAC_TABS = ['matrix', 'roles', 'resources'];

/**
 * @param {string | undefined} value
 */
export function parseRbacTab(value) {
  if (value && RBAC_TABS.includes(value)) return value;
  return 'matrix';
}

/**
 * @param {{ tab?: string, page?: number, limit?: number }} params
 */
export function buildRbacQuerySuffix({ tab, page, limit }) {
  const qs = new URLSearchParams();
  const safeTab = parseRbacTab(tab);
  if (safeTab !== 'matrix') qs.set('tab', safeTab);
  if (page > 1) qs.set('page', String(page));
  if (limit !== DEFAULT_LIST_LIMIT) qs.set('limit', String(limit));
  return qs.toString();
}

/**
 * @param {Record<string, string | undefined>} searchParams
 */
export function parseRbacListParams(searchParams) {
  const tab = parseRbacTab(searchParams.tab);
  const page = parseListPage(searchParams.page);
  const limit = parseListLimit(searchParams.limit);
  return { tab, page, limit };
}
