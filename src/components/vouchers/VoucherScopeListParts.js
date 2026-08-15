'use client';

import { useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
import { applyVoucherToSkuPrice } from '@/lib/vouchers/voucherDisplay';
import { cn, formatCurrency } from '@/lib/shared/utils';
import {
  scopeProductCopyValue,
  scopeSkuCopyValue,
  scopeProductCopyLabel,
  scopeSkuCopyLabel,
  getRowSkuPriceLines,
} from '@/components/vouchers/voucherScopeListHelpers';

const VARIANT_LINE_LIST_CLASS = 'divide-y divide-gray-200';
const VARIANT_LINE_ITEM_CLASS = 'flex min-h-[28px] items-center py-1.5';
const VARIANT_LABEL_CLASS = 'truncate text-[14px] font-semibold text-gray-600';

/**
 * @param {{
 *   lines: Array<{ skuId: string, label: string, price: string, priceAmount?: number, originalPrice?: string | null }>,
 *   compact?: boolean,
 *   discount?: object | null,
 *   minOrder?: number,
 * }} props
 */
export function SkuPriceLines({ lines, compact, discount, minOrder = 0 }) {
  if (!lines?.length) return null;

  const showAfter = Boolean(discount);
  const gridClass = showAfter
    ? 'grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-2'
    : 'grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2';

  return (
    <div className={cn(compact ? 'mt-1' : 'mt-1.5')}>
      {showAfter && (
        <div
          className={cn(
            gridClass,
            'mb-1 text-[9px] font-semibold uppercase tracking-wide text-gray-400',
            compact ? 'text-[8px]' : '',
          )}
        >
          <span>Biến thể</span>
          <span className="text-right">Giá gốc</span>
          <span className="text-right text-brand-primary">Sau voucher</span>
        </div>
      )}
      <ul className="space-y-0.5">
        {lines.map((line) => {
          const amount = line.priceAmount ?? 0;
          const meetsMin = !minOrder || amount >= minOrder;
          const { after } = meetsMin && discount
            ? applyVoucherToSkuPrice(amount, discount)
            : { after: amount };

          return (
            <li
              key={line.skuId}
              className={cn(gridClass, compact ? 'text-[11px]' : 'text-xs')}
            >
              <span
                className={cn(
                  'min-w-0 truncate text-gray-600',
                  compact ? 'text-[13px] font-semibold' : 'text-[14px] font-semibold',
                )}
                title={line.label}
              >
                {line.label}
              </span>
              <span className="shrink-0 text-right whitespace-nowrap">
                {line.originalPrice && (
                  <span className="mr-1 text-[10px] text-gray-400 line-through tabular-nums">
                    {line.originalPrice}
                  </span>
                )}
                <span className="font-bold text-brand-dark tabular-nums">{line.price}</span>
              </span>
              {showAfter && (
                <span
                  className={cn(
                    'shrink-0 text-right font-bold tabular-nums whitespace-nowrap',
                    meetsMin ? 'text-brand-primary' : 'text-gray-400',
                  )}
                  title={!meetsMin ? `Cần đơn từ ${formatCurrency(minOrder)}` : undefined}
                >
                  {meetsMin ? formatCurrency(after) : '—'}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * @param {{ row: object, mode: string, discount?: object | null, minOrder?: number, serial?: number }} props
 */
export function CompactScopeRow({ row, mode, discount, minOrder = 0, serial }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const priceLines = getRowSkuPriceLines(row);
  const hasVariants = priceLines.length > 1;
  const showVariantList = priceLines.length > 0 && (!hasVariants || isExpanded);

  return (
    <li
      className={cn(
        'px-1.5 py-1.5 transition-colors hover:bg-brand-gray/40',
        row.missing && 'bg-amber-50/50',
      )}
    >
      <div className="flex items-start gap-1.5">
        <div className="flex shrink-0 items-start gap-1">
          {serial != null ? (
            <span className="mt-0.5 w-3 shrink-0 text-left text-[10px] font-semibold tabular-nums text-gray-400">
              {serial}
            </span>
          ) : null}
          <ScopeProductThumb row={row} size="sm" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex min-w-0 items-center gap-1.5">
            <ScopeProductName
              row={row}
              className="min-w-0 flex-1 truncate text-xs font-semibold leading-snug text-brand-dark"
            />
            {row.productId ? (
              <IdCopy
                value={scopeProductCopyValue(row)}
                label={scopeProductCopyLabel()}
                compact
                showLabel={false}
                plain
                className="shrink-0"
              />
            ) : null}
          </div>

          {hasVariants ? (
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              aria-expanded={isExpanded}
              className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition-colors',
                isExpanded
                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-brand-primary hover:text-brand-primary',
              )}
            >
              <Chevron
                className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')}
              />
              {isExpanded ? 'Thu gọn' : `${priceLines.length} biến thể`}
            </button>
          ) : null}

          {showVariantList ? (
            <SkuPriceLines
              lines={priceLines}
              compact
              discount={discount}
              minOrder={minOrder}
            />
          ) : !priceLines.length ? (
            <p className="mt-1 text-[11px] font-bold text-brand-dark tabular-nums">{row.price}</p>
          ) : null}
        </div>
      </div>

      {mode === 'skus' && !row.productId && row.variants?.[0] && (
        <div className="mt-1 pl-9">
          <IdCopy
            value={scopeSkuCopyValue(row.variants[0])}
            label={scopeSkuCopyLabel()}
            compact
            showLabel={false}
            plain
            iconFeedback
          />
        </div>
      )}
    </li>
  );
}

/**
 * @param {{
 *   row: object,
 *   mode: string,
 *   minOrder: number,
 *   discount?: object | null,
 *   serial?: number,
 *   isExpanded: boolean,
 *   onToggleExpand: () => void,
 * }} props
 */
export function DesktopTableRow({ row, mode, minOrder, discount, serial, isExpanded, onToggleExpand }) {
  const hasVariants = row.variantCount > 0;
  const priceLines = getRowSkuPriceLines(row);
  const showAfter = Boolean(discount);

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-brand-gray/30',
        row.missing && 'bg-amber-50/40',
        isExpanded && hasVariants && 'bg-brand-gray/20',
      )}
    >
      <td className="px-2 py-3 align-top text-center">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-gray text-xs font-semibold tabular-nums text-gray-500">
          {serial}
        </span>
      </td>
      <td className="px-3 py-3 min-w-0 align-top">
        <div className="flex items-start gap-3">
          <ScopeProductThumb row={row} size="lg" />
          <div className="min-w-0 flex-1">
            <ScopeProductName
              row={row}
              className="text-sm font-semibold leading-snug text-brand-dark line-clamp-2"
            />
            {minOrder > 0 && !row.missing && (
              <p className="mt-1 text-[10px] text-gray-400">
                Đơn từ {formatCurrency(minOrder)}
              </p>
            )}
            {hasVariants && row.productId && (
              <>
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className={cn(
                    'mt-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors',
                    isExpanded
                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-brand-primary hover:text-brand-primary',
                  )}
                >
                  <Chevron className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
                  {row.variantCount} SKU
                </button>
                {isExpanded && (
                  <div className="mt-2 w-full text-left">
                    <ExpandedSkuList variants={row.variants} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        {row.productId ? (
          <IdCopy
            value={scopeProductCopyValue(row)}
            label={scopeProductCopyLabel()}
            block
          />
        ) : row.variants?.[0] ? (
          <IdCopy
            value={scopeSkuCopyValue(row.variants[0])}
            label={scopeSkuCopyLabel()}
            block
            iconFeedback
          />
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-3 py-3 align-top">
        <VariantColumn lines={priceLines} row={row} />
      </td>
      <td className="px-3 py-3 align-top text-right">
        <PriceColumn lines={priceLines} fallback={row.price} />
      </td>
      <td className="px-3 py-3 align-top text-right">
        {showAfter ? (
          <AfterVoucherColumn lines={priceLines} discount={discount} minOrder={minOrder} />
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
    </tr>
  );
}

/** @param {{ lines: object[], row: object }} props */
function VariantColumn({ lines, row }) {
  if (lines.length > 0) {
    return (
      <ul className={VARIANT_LINE_LIST_CLASS}>
        {lines.map((line) => (
          <li
            key={line.skuId}
            className={cn(VARIANT_LINE_ITEM_CLASS, VARIANT_LABEL_CLASS)}
            title={line.label}
          >
            {line.label}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <span className="text-xs text-gray-500">
      {row.variantCount === 1 ? '1 SKU' : '—'}
    </span>
  );
}

/** @param {{ lines: object[], fallback?: string }} props */
function PriceColumn({ lines, fallback }) {
  if (!lines.length) {
    return (
      <span className="text-sm font-bold text-brand-dark tabular-nums whitespace-nowrap">
        {fallback ?? '—'}
      </span>
    );
  }

  return (
    <ul className={VARIANT_LINE_LIST_CLASS}>
      {lines.map((line) => (
        <li key={line.skuId} className={cn(VARIANT_LINE_ITEM_CLASS, 'justify-end whitespace-nowrap tabular-nums')}>
          {line.originalPrice && (
            <span className="mr-1 text-[10px] font-medium text-gray-400 line-through">
              {line.originalPrice}
            </span>
          )}
          <span className="text-sm font-bold text-brand-dark">{line.price}</span>
        </li>
      ))}
    </ul>
  );
}

/** @param {{ lines: object[], discount: object, minOrder: number }} props */
function AfterVoucherColumn({ lines, discount, minOrder }) {
  return (
    <ul className={VARIANT_LINE_LIST_CLASS}>
      {lines.map((line) => {
        const amount = line.priceAmount ?? 0;
        const meetsMin = !minOrder || amount >= minOrder;
        const { after } = meetsMin && discount
          ? applyVoucherToSkuPrice(amount, discount)
          : { after: amount };

        return (
          <li
            key={line.skuId}
            className={cn(
              VARIANT_LINE_ITEM_CLASS,
              'justify-end text-sm font-bold tabular-nums whitespace-nowrap',
              meetsMin ? 'text-brand-primary' : 'text-gray-400',
            )}
            title={!meetsMin ? `Cần đơn từ ${formatCurrency(minOrder)}` : undefined}
          >
            {meetsMin ? formatCurrency(after) : '—'}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * @param {{ variants: object[], compact?: boolean, idsOnly?: boolean }} props
 */
export function ExpandedSkuList({ variants, compact, idsOnly = true }) {
  return (
    <ul className={cn('flex w-full min-w-0 flex-col items-start', compact ? 'gap-1.5' : 'gap-2')}>
      {variants.map((variant) => (
        <li
          key={variant.skuId}
          className={cn(
            'flex w-full min-w-0 flex-col items-start gap-1 rounded-lg border border-gray-200 bg-white text-left',
            compact ? 'px-1.5 py-1 text-[10px]' : 'px-2.5 py-2 text-xs',
          )}
        >
          <div className="flex w-full min-w-0 flex-wrap items-start justify-start gap-x-2 gap-y-1">
            <span
              className={cn(
                'shrink-0 text-gray-700',
                compact ? 'text-[12px] font-semibold' : 'text-[14px] font-semibold',
              )}
              title={variant.variantLabel}
            >
              {variant.variantLabel}
            </span>
            <IdCopy
              value={scopeSkuCopyValue(variant)}
              label={scopeSkuCopyLabel()}
              compact
              iconFeedback
              className="max-w-full justify-start"
            />
          </div>
          {!idsOnly && (
            <span className="font-bold text-brand-dark tabular-nums">{variant.price}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * @param {{
 *   variantCount: number,
 *   isExpanded: boolean,
 *   onToggle: () => void,
 *   compact?: boolean,
 *   loose?: boolean,
 *   inline?: boolean,
 * }} props
 */
export function VariantToggle({ variantCount, isExpanded, onToggle, compact, loose, inline }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 font-semibold transition-colors',
        inline
          ? cn(
            'rounded-md border px-2 py-0.5 text-[10px]',
            isExpanded
              ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
              : 'border-gray-300 bg-white text-gray-600 hover:border-brand-primary hover:text-brand-primary',
          )
          : cn(
            'text-gray-600 hover:text-brand-primary',
            compact
              ? 'text-[10px]'
              : cn(
                'w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-xs',
                loose ? 'min-h-[40px]' : 'min-h-[32px]',
              ),
          ),
      )}
    >
      <Chevron className={cn(compact || inline ? 'h-3 w-3' : 'h-4 w-4', 'transition-transform', isExpanded && 'rotate-180')} />
      {inline ? `${variantCount} SKU` : isExpanded ? 'Thu gọn mã SKU' : `Xem mã ${variantCount} SKU`}
    </button>
  );
}

function DraftBadge() {
  return (
    <span className="ml-1 inline-flex align-middle rounded bg-amber-100 px-1 py-px text-[8px] font-semibold text-amber-800 ring-1 ring-amber-200">
      Nháp
    </span>
  );
}

function RemovedBadge() {
  return (
    <span className="ml-1 inline-flex align-middle rounded bg-red-50 px-1 py-px text-[8px] font-semibold text-red-700 ring-1 ring-red-200">
      Đã xóa
    </span>
  );
}

/** @param {{ serial: number, compact?: boolean }} props */
export function SerialBadge({ serial, compact }) {
  return (
    <span
      className={cn(
        'shrink-0 font-semibold tabular-nums text-gray-400',
        compact ? 'min-w-[0.875rem] text-left text-[10px] leading-8' : 'w-6 text-center text-xs',
      )}
    >
      {serial}
    </span>
  );
}

/**
 * @param {{
 *   value: string,
 *   label?: string,
 *   compact?: boolean,
 *   block?: boolean,
 *   className?: string,
 *   iconFeedback?: boolean,
 *   showLabel?: boolean,
 *   plain?: boolean,
 * }} props
 */
export function IdCopy({
  value,
  label = 'Mã sản phẩm',
  compact,
  block,
  className,
  iconFeedback = false,
  showLabel = true,
  plain = false,
}) {
  const [copied, setCopied] = useState(false);

  if (!value?.trim()) {
    return compact ? null : <span className="text-xs text-gray-400">—</span>;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  if (block) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={`Copy ${label}`}
        aria-label={iconFeedback ? (copied ? 'Đã copy mã' : `Copy ${label}`) : undefined}
        className="group w-full max-w-[200px] rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-left transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/5"
      >
        {showLabel ? (
          <span className="block text-[13px] font-semibold uppercase tracking-wide text-gray-500 group-hover:text-gray-600">
            {label}
          </span>
        ) : null}
        <span className={cn('flex items-center gap-1', showLabel && 'mt-0.5')}>
          <span className="min-w-0 flex-1 truncate font-mono text-[16px] font-semibold text-brand-dark">{value}</span>
          <CopyFeedback copied={copied} iconOnly={iconFeedback} />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label}`}
      aria-label={copied ? 'Đã copy mã' : `Copy ${label}`}
      className={cn(
        'group inline-flex max-w-full min-w-0 items-center gap-1 rounded font-mono text-brand-dark transition-colors',
        plain
          ? 'border-0 bg-transparent px-0 py-0 hover:text-brand-primary'
          : 'border border-gray-200/80 bg-white/80 hover:border-brand-primary/40 hover:bg-brand-primary/5',
        !plain && (compact ? 'px-1 py-0.5 text-[15px] leading-tight' : 'gap-1.5 px-2 py-1 text-[16px]'),
        plain && (compact ? 'text-[12px] leading-tight' : 'text-sm'),
        className,
      )}
    >
      {showLabel ? (
        <span className="shrink-0 text-[13px] font-semibold text-gray-500 group-hover:text-gray-600">
          {label}
        </span>
      ) : null}
      <span
        className={cn(
          'truncate font-mono font-semibold',
          plain && compact ? 'text-[12px]' : 'text-[17px]',
        )}
      >
        {value}
      </span>
      <CopyFeedback copied={copied} iconOnly={iconFeedback || plain} />
    </button>
  );
}

/** @param {{ copied: boolean, iconOnly?: boolean }} props */
function CopyFeedback({ copied, iconOnly }) {
  if (iconOnly) {
    if (!copied) return null;
    return (
      <span className="shrink-0 text-brand-primary" aria-hidden>
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span className="shrink-0 text-[10px] font-semibold text-gray-400 group-hover:text-brand-primary">
      {copied ? '✓' : 'Copy'}
    </span>
  );
}

/** @param {{ className?: string }} props */
function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

/** @param {object} row */
function resolveProductDetailHref(row) {
  if (!row?.productId || row.missing) return null;
  const status = row.isDraft ? 'draft' : 'published';
  return `/products/${row.productId}?status=${status}`;
}

/** @param {{ row: object, className?: string }} props */
export function ScopeProductName({ row, className }) {
  const href = resolveProductDetailHref(row);
  const isTruncate = typeof className === 'string' && className.includes('truncate');

  const nameNode = href ? (
    <Link
      href={href}
      className={cn(
        'text-brand-dark transition-colors hover:text-brand-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 rounded-sm',
        isTruncate && 'block truncate',
      )}
      title={`Xem chi tiết: ${row.productName}`}
    >
      {row.productName}
    </Link>
  ) : (
    <span className={cn(isTruncate && 'block truncate')} title={row.productName}>
      {row.productName}
    </span>
  );

  return (
    <p className={className}>
      {nameNode}
      {row.isRemoved && <RemovedBadge />}
      {row.isDraft && !row.isRemoved && <DraftBadge />}
    </p>
  );
}

/** @param {{ row: object, size?: 'sm' | 'md' | 'lg' }} props */
export function ScopeProductThumb({ row, size = 'md' }) {
  const href = resolveProductDetailHref(row);
  const thumb = <Thumb src={row.thumb} alt={row.productName} size={size} />;

  if (!href) return thumb;

  return (
    <Link
      href={href}
      className="shrink-0 rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
      title={`Xem chi tiết: ${row.productName}`}
    >
      {thumb}
    </Link>
  );
}

/** @param {{ src?: string, alt?: string, size?: 'sm' | 'md' | 'lg' }} props */
function Thumb({ src, alt, size = 'md' }) {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white',
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-10 w-10',
        size === 'lg' && 'h-12 w-12',
      )}
    >
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt ?? 'Sản phẩm'}
          preset="thumb"
          sizes={`${dim}px`}
          width={dim}
          height={dim}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-brand-gray text-[8px] text-gray-400">
          —
        </div>
      )}
    </div>
  );
}

/** @param {{ className?: string }} props */
function Chevron({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
