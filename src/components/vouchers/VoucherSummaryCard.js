'use client';

import Link from 'next/link';
import VoucherStatusBadge from '@/components/vouchers/VoucherStatusBadge';
import VoucherCodeCopy from '@/components/vouchers/VoucherCodeCopy';
import VoucherValueBadge from '@/components/vouchers/VoucherValueBadge';
import VoucherUsageBar from '@/components/vouchers/VoucherUsageBar';
import VoucherRowActions from '@/components/vouchers/VoucherRowActions';
import {
  getAppliesToConfig,
  getVoucherScopeLabelFromDiscount,
  getVoucherScopeValueTone,
  getVoucherUsage,
} from '@/lib/vouchers/voucherDisplay';
import { getVoucherLifecycleStatus } from '@/lib/vouchers/voucherSchema';
import { getVoucherCardTheme } from '@/lib/vouchers/voucherLifecycleUi';
import { formatCurrency, formatDate, cn } from '@/lib/shared/utils';

/**
 * Card tóm tắt voucher — dùng chung detail + danh sách.
 *
 * @param {{
 *   discount: object,
 *   scopeLabel?: string,
 *   minOrder?: number,
 *   href?: string,
 *   showActions?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   className?: string,
 * }} props
 */
export default function VoucherSummaryCard({
  discount,
  scopeLabel: scopeLabelProp,
  minOrder: minOrderProp,
  href,
  showActions = false,
  canUpdate = false,
  canDelete = false,
  className,
}) {
  const applies = getAppliesToConfig(discount.discount_applies_to);
  const scopeLabel = scopeLabelProp ?? getVoucherScopeLabelFromDiscount(discount);
  const scopeTone = getVoucherScopeValueTone(discount);
  const minOrder = minOrderProp ?? Number(discount.discount_min_order_value ?? 0);
  const { used, max } = getVoucherUsage(discount);
  const maxPerUser = discount.discount_max_uses_per_user ?? 1;
  const validityStart = formatDate(discount.discount_start_date, 'datetime');
  const validityEnd = formatDate(discount.discount_end_date, 'datetime');
  const lifecycle = getVoucherLifecycleStatus(discount);
  const cardTheme = getVoucherCardTheme(lifecycle);
  /** Danh sách — layout gọn hơn trang chi tiết */
  const dense = showActions;

  const titleClass = cn(
    'font-bold leading-tight text-brand-dark line-clamp-2',
    dense ? 'mt-1 text-sm' : 'text-sm md:text-base leading-snug',
  );

  const gridSectionPad = dense ? 'py-2' : 'py-0';

  const headerColPad = dense ? 'px-3 py-2' : 'px-4 py-3 lg:px-5';
  const detailFourColGridClass = cn(
    'grid divide-gray-200 grid-cols-1 divide-y md:divide-y-0 md:divide-x md:items-stretch',
    'md:grid-cols-[8rem_minmax(0,2fr)_minmax(13rem,1.35fr)_minmax(0,0.95fr)]',
  );
  const footerGridClass = dense
    ? cn('grid divide-gray-200 grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y')
    : detailFourColGridClass;
  const gridCellClass = cn('min-w-0', headerColPad);
  const headerColumnLabelClass = 'mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500';

  return (
    <article
      data-voucher-lifecycle={lifecycle}
      className={cn(
        'relative rounded-xl border shadow-sm',
        cardTheme.border,
        cardTheme.bg,
        href && 'cursor-pointer transition-shadow hover:shadow-md',
        href && cardTheme.hoverBorder,
        className,
      )}
    >
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
          aria-label={`Xem chi tiết voucher ${discount.discount_name}`}
        />
      )}

      <div className={cn('relative z-[1]', href && 'pointer-events-none')}>
        <div
          className={cn(
            gridSectionPad,
            cardTheme.header,
          )}
        >
          <div
            className={cn(
              dense
                ? 'grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-[minmax(0,1fr)_auto_auto] md:divide-x md:divide-y-0 md:items-stretch'
                : detailFourColGridClass,
            )}
          >
            {dense ? (
              <div className={cn('flex min-w-0 items-start gap-2', headerColPad)}>
                <VoucherValueBadge
                  discount={discount}
                  size="sm"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <VoucherStatusBadge discount={discount} dense={dense} />
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[13px] font-semibold ring-1',
                        applies.className,
                      )}
                    >
                      {applies.label}
                    </span>
                  </div>
                  <h2 className={titleClass}>{discount.discount_name}</h2>
                  <VoucherCodeCopy
                    code={discount.discount_code}
                    size="sm"
                    variant="inline"
                    label="Mã voucher"
                    className="mt-1 pointer-events-auto"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className={cn(gridCellClass, 'flex flex-col justify-center')}>
                  <p className={headerColumnLabelClass}>Giá trị</p>
                  <VoucherValueBadge
                    discount={discount}
                    size="md"
                    className="w-[118px] shrink-0 px-2"
                  />
                </div>

                <div className={cn(gridCellClass, 'flex flex-col justify-center')}>
                  <p className={headerColumnLabelClass}>Voucher</p>
                  <h2 className={titleClass}>{discount.discount_name}</h2>
                  {discount.discount_description &&
                    discount.discount_description !== discount.discount_name && (
                      <p className="mt-0.5 text-xs text-gray-600 line-clamp-2 md:text-sm">
                        {discount.discount_description}
                      </p>
                    )}
                </div>
              </>
            )}

            {!dense ? (
              <>
                <div
                  className={cn(
                    gridCellClass,
                    'flex flex-col justify-start md:items-center md:text-center',
                    href && 'pointer-events-auto',
                  )}
                >
                  <VoucherCodeCopy
                    code={discount.discount_code}
                    size="xl"
                    variant="inline"
                    label="Mã voucher"
                    className="w-full max-w-none md:mx-auto"
                  />
                </div>

                <div className={cn(gridCellClass, 'flex flex-col justify-center md:items-start md:text-left')}>
                  <HeaderValidityColumn start={validityStart} end={validityEnd} compact={dense} align="left" />
                </div>
              </>
            ) : (
              <>
                <div className={cn(gridCellClass, 'flex flex-col justify-center')}>
                  <HeaderValidityColumn start={validityStart} end={validityEnd} compact={dense} />
                </div>

                <div
                  className={cn(
                    gridCellClass,
                    'flex flex-col justify-center md:items-end md:text-right',
                    href && 'pointer-events-auto',
                  )}
                >
                  {showActions && (canUpdate || canDelete) && (
                    <div className="flex flex-wrap justify-end gap-1 md:justify-end">
                      <VoucherRowActions
                        code={discount.discount_code}
                        discountId={discount._id}
                        discount={discount}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        layout="row"
                        hideDetailLink
                        compact={dense}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <VoucherTearLine compact={dense} edgeBorder={cardTheme.tear} dashBorder={cardTheme.tearDash} />

        <div
          className={cn(
            gridSectionPad,
            lifecycle === 'inactive' && 'opacity-95',
          )}
        >
          <div className={footerGridClass}>
            <div className={gridCellClass}>
              <DetailRow
                label="Đơn tối thiểu"
                value={minOrder > 0 ? formatCurrency(minOrder) : 'Không yêu cầu'}
                highlight={minOrder > 0}
                valueTone={minOrder > 0 ? 'amber' : 'muted'}
                valueClassName={minOrder > 0 ? (dense ? 'text-[18px]' : 'text-[17px]') : undefined}
                compact={dense}
                plain
              />
            </div>

            <div className={gridCellClass}>
              <DetailRow label="Phạm vi áp dụng" value={scopeLabel} valueTone={scopeTone} compact={dense} plain />
            </div>
            <div className={cn(gridCellClass, !dense && 'flex flex-col justify-start')}>
              <p
                className={cn(
                  'font-semibold uppercase tracking-wide text-gray-600',
                  dense ? 'mb-0.5 text-[13px]' : 'mb-1.5 text-[11px]',
                )}
              >
                Lượt sử dụng
              </p>
              <VoucherUsageBar
                discount={discount}
                size="sm"
                compact={dense}
                hideBar={dense}
                denseText={dense}
              />
            </div>
            <div className={gridCellClass}>
              <DetailRow
                label="Giới hạn lượt"
                value={`${maxPerUser} lượt/khách · ${used}/${max} tổng`}
                valueTone="brand"
                compact={dense}
                plain
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Đường xé + khuyên tròn hai bên — giống phiếu voucher vật lý.
 *
 * @param {{ compact?: boolean, edgeBorder: string, dashBorder: string }} props
 */
function VoucherTearLine({ compact = false, edgeBorder, dashBorder }) {
  const notch = compact ? 'h-4 w-4 md:h-4 md:w-4' : 'h-5 w-5 md:h-6 md:w-6';
  const notchInset = compact ? 'right-4 left-4 md:right-5 md:left-5' : 'right-5 left-5 md:right-6 md:left-6';

  return (
    <div className="relative z-[2] h-0" aria-hidden>
      <span
        className={cn(
          'absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-brand-gray',
          'shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)]',
          notch,
          edgeBorder,
        )}
      />
      <span
        className={cn(
          'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full border bg-brand-gray',
          'shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)]',
          notch,
          edgeBorder,
        )}
      />
      <div
        className={cn(
          'absolute top-0 -translate-y-1/2 border-t border-dashed',
          notchInset,
          dashBorder,
        )}
      />
    </div>
  );
}

/**
 * @param {{ start: string, end: string, compact?: boolean, align?: 'left' | 'center' | 'right' }} props
 */
export function HeaderValidityColumn({ start, end, compact = false, align = 'center' }) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'left' ? 'text-left' : 'text-center';

  return (
    <div className={cn('min-w-0', alignClass)}>
      <p
        className={cn(
          'font-semibold uppercase tracking-wide text-gray-500',
          compact ? 'mb-2 text-[13px]' : 'mb-2 text-xs',
        )}
      >
        Thời gian hiệu lực
      </p>
      <p
        className={cn(
          'font-semibold leading-tight text-brand-dark tabular-nums',
          compact ? 'mt-0.5 text-[14px]' : 'mt-1.5 text-xs md:text-sm leading-snug',
        )}
      >
        <span className="block">{start}</span>
        <span
          className={cn(
            'block font-medium text-gray-400',
            compact ? 'my-px text-[12px]' : 'my-0.5 text-[10px] md:text-xs',
          )}
        >
          →
        </span>
        <span className="block">{end}</span>
      </p>
    </div>
  );
}

/**
 * @param {{
 *   label: string,
 *   value: string,
 *   mono?: boolean,
 *   highlight?: boolean,
 *   valueTone?: 'default' | 'amber' | 'violet' | 'brand' | 'muted',
 *   compact?: boolean,
 *   multiline?: boolean,
 *   plain?: boolean,
 *   valueClassName?: string,
 * }} props
 */
export function DetailRow({
  label,
  value,
  mono,
  highlight,
  valueTone = 'default',
  compact,
  multiline,
  plain = false,
  valueClassName,
}) {
  const valueToneClass = {
    default: 'text-brand-dark',
    amber: 'text-amber-800',
    violet: 'text-violet-700',
    brand: 'text-brand-primary',
    muted: 'text-gray-600',
  }[valueTone];

  return (
    <div
      className={cn(
        'min-w-0',
        !plain && 'rounded-lg -mx-1.5',
        !plain && (compact ? 'px-1 py-0.5' : 'px-1.5 py-1'),
        highlight && 'bg-amber-50/80',
      )}
    >
      <p
        className={cn(
          'font-semibold uppercase tracking-wide text-gray-600',
          compact ? 'text-[13px]' : 'text-[11px]',
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'font-semibold break-words',
          compact ? 'mt-px text-[15px] leading-snug' : 'mt-0.5 text-sm',
          valueToneClass,
          mono && 'font-mono text-[11px] font-medium break-all',
          multiline && 'whitespace-pre-line tabular-nums',
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}
