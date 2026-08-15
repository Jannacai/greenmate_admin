'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import VoucherStatusBadge from '@/components/vouchers/VoucherStatusBadge';
import VoucherCodeCopy from '@/components/vouchers/VoucherCodeCopy';
import VoucherValueBadge from '@/components/vouchers/VoucherValueBadge';
import VoucherUsageBar from '@/components/vouchers/VoucherUsageBar';
import VoucherRowActions from '@/components/vouchers/VoucherRowActions';
import VoucherAppliesSection from '@/components/vouchers/VoucherAppliesSection';
import { AdminButtonOutline, AdminInput } from '@/components/admin';
import { cancelUserVoucherAction } from '@/lib/actions/discount';
import {
  getAppliesToConfig,
  getVoucherConditionSummary,
  getVoucherUsage,
} from '@/lib/vouchers/voucherDisplay';
import { showError, showSuccess } from '@/lib/shared/toast';
import { formatCurrency, formatDate, cn } from '@/lib/shared/utils';

/**
 * Trang chi tiết voucher — hero gọn + sidebar phạm vi (pattern Banner/Collection).
 *
 * @param {{
 *   discount: object,
 *   scope: ReturnType<import('@/lib/vouchers/voucherScopeFromApi').mapDiscountScopeApiToDisplay>,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 * }} props
 */
export default function VoucherDetailView({
  discount,
  scope,
  canUpdate = false,
  canDelete = false,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [releaseUserId, setReleaseUserId] = useState('');

  const { minOrder } = getVoucherConditionSummary(discount, scope);
  const usersUsed = discount.discount_users_used ?? [];
  const applies = getAppliesToConfig(discount.discount_applies_to);
  const { used, max } = getVoucherUsage(discount);
  const maxPerUser = discount.discount_max_uses_per_user ?? 1;

  const validityStart = formatDate(discount.discount_start_date, 'datetime');
  const validityEnd = formatDate(discount.discount_end_date, 'datetime');
  const description =
    discount.discount_description &&
    discount.discount_description !== discount.discount_name
      ? discount.discount_description
      : null;

  function handleReleaseUser() {
    const userId = releaseUserId.trim();
    if (!userId) return;

    startTransition(async () => {
      const res = await cancelUserVoucherAction({
        code: discount.discount_code,
        userId,
      });
      if (res?.error) {
        showError('Gỡ voucher thất bại', res.error);
      } else {
        showSuccess(res.message ?? 'Đã gỡ voucher khỏi khách hàng');
        setReleaseUserId('');
        router.refresh();
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-8 lg:items-start">
      <div className="space-y-4 lg:col-span-5">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <VoucherValueBadge
              discount={discount}
              size="sm"
              className="w-[72px] shrink-0 px-1.5 py-1.5"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="text-lg font-bold leading-snug text-brand-dark">
                      {discount.discount_name}
                    </h2>
                    <VoucherStatusBadge discount={discount} dense />
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <VoucherCodeCopy
                      code={discount.discount_code}
                      size="sm"
                      variant="inline"
                      plain
                      showLabel={false}
                    />
                    {minOrder > 0 ? (
                      <span className="text-xs text-gray-500">
                        · Đơn từ{' '}
                        <span className="font-semibold text-amber-800">
                          {formatCurrency(minOrder)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">· Không yêu cầu đơn tối thiểu</span>
                    )}
                  </div>

                  {description ? (
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
                  ) : null}
                </div>

                {(canUpdate || canDelete) && (
                  <div className="shrink-0 sm:pt-0.5">
                    <VoucherRowActions
                      code={discount.discount_code}
                      discountId={discount._id}
                      discount={discount}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      layout="row"
                      hideDetailLink
                      compact
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <dl className="mt-4 grid gap-x-4 gap-y-2.5 border-t border-gray-100 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetaItem
              label="Phạm vi"
              value={applies.label}
              valueClassName={
                discount.discount_applies_to === 'all' ? undefined : 'text-violet-700'
              }
            />
            <MetaItem
              label="Giới hạn"
              value={`${maxPerUser}/khách · ${used}/${max} tổng`}
            />
            <div className="min-w-0 sm:col-span-2 lg:col-span-1">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Lượt sử dụng
              </dt>
              <dd className="mt-1">
                <VoucherUsageBar discount={discount} size="sm" />
              </dd>
            </div>
            <MetaItem label="Bắt đầu" value={validityStart} />
            <MetaItem label="Kết thúc" value={validityEnd} />
          </dl>
        </section>

        {canUpdate && (
          <section className="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 p-3">
            <h3 className="text-sm font-bold text-brand-dark">Gỡ voucher khỏi khách</h3>
            <p className="mt-0.5 text-xs text-gray-600">
              Khi khách bị kẹt trạng thái đã dùng mã.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <AdminInput
                type="text"
                value={releaseUserId}
                onChange={(e) => setReleaseUserId(e.target.value)}
                placeholder="User MongoDB _id"
                className="flex-1 font-mono"
              />
              <AdminButtonOutline
                type="button"
                disabled={isPending || !releaseUserId.trim()}
                onClick={handleReleaseUser}
                className="shrink-0"
              >
                {isPending ? 'Đang xử lý…' : 'Gỡ voucher'}
              </AdminButtonOutline>
            </div>

            <dl className="mt-3 grid gap-2 border-t border-amber-200/80 pt-2.5 sm:grid-cols-3">
              <TechMeta label="ID voucher" value={String(discount._id ?? '—')} />
              <TechMeta label="Shop ID" value={String(discount.discount_shopId ?? '—')} />
              <TechMeta label="Khách đã gắn" value={`${usersUsed.length} user`} />
            </dl>
          </section>
        )}

        {!canUpdate && !canDelete && (
          <p className="text-xs text-gray-400">Bạn chỉ có quyền xem voucher này.</p>
        )}
      </div>

      <aside className="lg:col-span-3 lg:sticky lg:top-4 lg:self-start">
        <VoucherAppliesSection scope={scope} layout="sidebar" discount={discount} />
      </aside>
    </div>
  );
}

/**
 * @param {{ label: string, value: string, valueClassName?: string }} props
 */
function MetaItem({ label, value, valueClassName }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className={cn('mt-0.5 text-sm font-semibold text-brand-dark', valueClassName)}>
        {value}
      </dd>
    </div>
  );
}

/**
 * @param {{ label: string, value: string }} props
 */
function TechMeta({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 truncate font-mono text-[11px] font-medium text-gray-600" title={value}>
        {value}
      </dd>
    </div>
  );
}
