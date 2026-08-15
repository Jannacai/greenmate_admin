import { Suspense } from 'react';

import { getDiscounts, getDiscountStats, getDiscountsExpiringSoon, getDiscountsExpiredAlert } from '@/lib/api/discount';

import VoucherFilterBar from '@/components/vouchers/VoucherFilterBar';
import VoucherHeaderAlerts from '@/components/vouchers/VoucherHeaderAlerts';
import { VOUCHER_EXPIRY_REMINDER_HOURS } from '@/lib/vouchers/voucherExpiryReminder';

import VoucherListTable from '@/components/vouchers/VoucherListTable';

import { getCachedMyPermissions } from '@/lib/rbac/getCachedPermissions';

import { getResourceCapabilities } from '@/lib/rbac/resourceCapabilities';
import { parseListLimit, parseListPage, DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

import { PageHeader, AdminErrorState } from '@/components/admin';

export const metadata = {
  title: 'Voucher',
};

export const dynamic = 'force-dynamic';

function buildFilterQuery(params) {
  const qs = new URLSearchParams();
  const keys = ['status', 'search', 'sort', 'applies_to', 'page', 'limit'];
  for (const key of keys) {
    if (params[key]) qs.set(key, params[key]);
  }
  return qs.toString();
}

function hasExtraVoucherFilters(params) {
  const defaultSort = params.status ? 'ctime' : 'lifecycle_asc';
  return Boolean(
    params.search ||
    params.applies_to ||
    (params.sort && params.sort !== defaultSort),
  );
}

/**
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function VouchersPage({ searchParams }) {
  const params = await searchParams;

  const permissions = await getCachedMyPermissions();

  const discountCaps = getResourceCapabilities('discount', permissions.grants);

  const page = parseListPage(params.page);
  const limit = parseListLimit(params.limit);

  let data = { items: [], total: 0, page: 1, limit: DEFAULT_LIST_LIMIT };

  let statusStats = null;

  let fetchError = null;

  let expiringSoon = [];

  let expiredAlert = { items: [], total: 0 };

  try {
    const [listData, statsData, expiringData, expiredData] = await Promise.all([
      getDiscounts({
        page,
        limit,
        status: params.status,
        search: params.search,
        sort: params.sort ?? (params.status ? 'ctime' : 'lifecycle_asc'),
        applies_to: params.applies_to,
      }),

      getDiscountStats({
        applies_to: params.applies_to,
      }),

      getDiscountsExpiringSoon({
        within_hours: VOUCHER_EXPIRY_REMINDER_HOURS,
        limit: 5,
      }).catch(() => ({ items: [] })),

      getDiscountsExpiredAlert({ limit: 5 }).catch(() => ({ items: [], total: 0 })),
    ]);

    data = listData;
    statusStats = statsData;
    expiringSoon = expiringData.items ?? [];
    expiredAlert = expiredData;
  } catch (err) {
    fetchError = err?.message ?? 'Không tải được danh sách voucher';
  }

  const extraFilters = hasExtraVoucherFilters(params);

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <PageHeader
        title="Voucher"
        middle={
          <VoucherHeaderAlerts
            expiringSoon={expiringSoon}
            expired={expiredAlert.items ?? []}
            expiredTotal={expiredAlert.total ?? 0}
          />
        }
      />

      <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-gray-100" />}>
        <VoucherFilterBar
          statusStats={statusStats ?? undefined}
          filteredTotal={data.total}
          hasActiveFilters={extraFilters}
          canCreate={discountCaps.canCreate}
        />
      </Suspense>

      {fetchError ? (
        <AdminErrorState
          message={fetchError}
          hint={<>Kiểm tra quyền module <strong>discount</strong> (read:any) và server tipjs đang chạy.</>}
        />
      ) : (
        <VoucherListTable
          vouchers={data.items}
          total={data.total}
          page={data.page}
          limit={data.limit}
          canCreate={discountCaps.canCreate}
          canUpdate={discountCaps.canUpdate}
          canDelete={discountCaps.canDelete}
          querySuffix={buildFilterQuery(params)}
        />
      )}
    </div>
  );
}
