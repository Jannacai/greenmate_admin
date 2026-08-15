'use client';

import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import VoucherSummaryCard from '@/components/vouchers/VoucherSummaryCard';
import VoucherStatusBadge from '@/components/vouchers/VoucherStatusBadge';
import VoucherCodeCopy from '@/components/vouchers/VoucherCodeCopy';
import VoucherRowActions from '@/components/vouchers/VoucherRowActions';
import {
  getVoucherScopeLabelFromDiscount,
  getVoucherScopeShortLabelFromDiscount,
  getVoucherUsage,
  getVoucherValueLabel,
} from '@/lib/vouchers/voucherDisplay';
import { getVoucherLifecycleStatus } from '@/lib/vouchers/voucherSchema';
import { cn, formatCurrency, formatDate } from '@/lib/shared/utils';
import {
  VOUCHER_TABLE_CELL_BASE,
  VOUCHER_TABLE_COL,
  VOUCHER_TABLE_DIVIDER,
} from '@/components/vouchers/voucherListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

const LIFECYCLE_ROW_ACCENT = {
  active: 'shadow-[inset_3px_0_0_0_#4ade80]',
  scheduled: 'shadow-[inset_3px_0_0_0_#60a5fa]',
  expired: 'shadow-[inset_3px_0_0_0_#fb7185]',
  inactive: 'shadow-[inset_3px_0_0_0_#d1d5db]',
};

const SCOPE_TONE_CLASS = {
  default: 'text-brand-dark',
  violet: 'text-violet-700',
};

/**
 * @param {{ value: string }} props
 */
function VoucherDateTableCell({ value }) {
  return (
    <span
      className="block text-center text-xs font-semibold leading-snug text-brand-dark tabular-nums whitespace-nowrap"
      title={value}
    >
      {value}
    </span>
  );
}

/**
 * @param {{
 *   voucher: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   desktopVariant?: 'card' | 'row',
 *   rowIndex?: number,
 * }} props
 */
export function VoucherListCard({
  voucher,
  canUpdate = false,
  canDelete = false,
  desktopVariant = 'card',
  rowIndex = 0,
}) {
  const detailHref = `/vouchers/${voucher._id}`;
  const lifecycle = getVoucherLifecycleStatus(voucher);
  const scopeLabel = getVoucherScopeLabelFromDiscount(voucher);
  const scopeShortLabel = getVoucherScopeShortLabelFromDiscount(voucher);
  const scopeTone = voucher.discount_applies_to === 'all' ? 'default' : 'violet';
  const minOrder = Number(voucher.discount_min_order_value ?? 0);
  const { used, max } = getVoucherUsage(voucher);
  const isPercent = voucher?.discount_type === 'percentage';
  const startLabel = voucher?.discount_start_date
    ? formatDate(voucher.discount_start_date, 'datetime')
    : '—';
  const endLabel = voucher?.discount_end_date
    ? formatDate(voucher.discount_end_date, 'datetime')
    : '—';

  if (desktopVariant === 'row') {
    return (
      <ProductListCardNav
        as="tr"
        href={detailHref}
        data-voucher-lifecycle={lifecycle}
        className={cn(
          getAdminListRowZebraClass(rowIndex),
          ADMIN_LIST_ROW_HOVER_CLASS,
          LIFECYCLE_ROW_ACCENT[lifecycle] ?? LIFECYCLE_ROW_ACCENT.inactive,
        )}
      >
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.code)}>
          <VoucherCodeCopy
            code={voucher.discount_code}
            size="md"
            variant="inline"
            plain
            showLabel={false}
            className="pointer-events-auto"
          />
        </td>
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.value, VOUCHER_TABLE_DIVIDER)}>
          <span
            className={cn(
              'text-xs font-semibold tabular-nums whitespace-nowrap',
              isPercent ? 'text-rose-700' : 'text-brand-dark',
            )}
          >
            {getVoucherValueLabel(voucher)}
          </span>
        </td>
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.minOrder, VOUCHER_TABLE_DIVIDER, 'text-center')}>
          <span
            className={cn(
              'text-xs font-semibold leading-none whitespace-nowrap',
              minOrder > 0 ? 'text-brand-dark' : 'text-gray-400',
            )}
          >
            {minOrder > 0 ? formatCurrency(minOrder) : 'Không yêu cầu'}
          </span>
        </td>
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.scope, VOUCHER_TABLE_DIVIDER, 'text-center')}>
          <span
            className={cn(
              'text-xs font-semibold leading-none whitespace-nowrap',
              SCOPE_TONE_CLASS[scopeTone] ?? SCOPE_TONE_CLASS.default,
            )}
            title={scopeLabel}
          >
            {scopeShortLabel}
          </span>
        </td>
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.start, VOUCHER_TABLE_DIVIDER, 'text-center')}>
          <VoucherDateTableCell value={startLabel} />
        </td>
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.end, VOUCHER_TABLE_DIVIDER, 'text-center')}>
          <VoucherDateTableCell value={endLabel} />
        </td>
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.usage, VOUCHER_TABLE_DIVIDER, 'text-center')}>
          <span className="text-xs font-semibold tabular-nums text-brand-dark whitespace-nowrap">
            {used}/{max}
          </span>
        </td>
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.status, VOUCHER_TABLE_DIVIDER, 'text-center')}>
          <VoucherStatusBadge
            discount={voucher}
            plain
            className="justify-center whitespace-nowrap"
          />
        </td>
        <td className={cn(VOUCHER_TABLE_CELL_BASE, VOUCHER_TABLE_COL.actions, VOUCHER_TABLE_DIVIDER, 'text-right')}>
          <VoucherRowActions
            code={voucher.discount_code}
            discountId={voucher._id}
            discount={voucher}
            canUpdate={canUpdate}
            canDelete={canDelete}
            layout="row"
            hideDetailLink
            compact
          />
        </td>
      </ProductListCardNav>
    );
  }

  return (
    <VoucherSummaryCard
      discount={voucher}
      href={detailHref}
      showActions
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  );
}

export default VoucherListCard;
