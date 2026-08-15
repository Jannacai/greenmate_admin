import Link from 'next/link';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import { getStorefrontProductBadgeClass } from '@/lib/products/productBadgeDisplay';
import { getPreviewDiscountPctClass } from '@/lib/products/variationDisplay';
import { getProductDetailSummaryTheme } from '@/lib/products/productLifecycleUi';
import { cn } from '@/lib/shared/utils';

/**
 * Thanh tóm tắt — định danh + thông tin sản phẩm, hiển thị dạng cột ngang ở đầu trang.
 *
 * @param {{
 *   status: 'published' | 'draft',
 *   typeLabel: string,
 *   soldCount?: number,
 *   productCode?: string | null,
 *   productName?: string | null,
 *   brand?: string | null,
 *   origin?: string | null,
 *   appliedVoucherCode?: string | null,
 *   appliedVoucherId?: string | null,
 *   badgeLabel?: string | null,
 *   badgeType?: string | null,
 *   discountLabel?: string | null,
 *   className?: string,
 * }} props
 */
export default function ProductPreviewSummaryBar({
  status,
  typeLabel,
  soldCount,
  productCode,
  productName,
  brand,
  origin,
  appliedVoucherCode,
  appliedVoucherId,
  badgeLabel,
  badgeType,
  discountLabel,
  className,
}) {
  const theme = getProductDetailSummaryTheme(status);
  const cellBorder = cn(
    'border-b',
    theme.sectionBorder,
    'md:border-r md:[&:nth-child(4n)]:border-r-0',
    'md:[&:nth-child(-n+4)]:border-b',
    'md:[&:nth-child(n+5)]:border-b-0',
    'last:border-b-0',
  );

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border shadow-sm',
        theme.border,
        theme.bg,
        className,
      )}
    >
      <div
        className={cn(
          'grid grid-cols-1',
          'md:grid-cols-[minmax(0,1fr)_minmax(8.5rem,11rem)_minmax(5.5rem,7rem)_minmax(0,1fr)]',
        )}
      >
        <SummaryColumn label="Sản phẩm" dense className={cellBorder}>
          <span
            className="line-clamp-2 text-sm font-bold leading-snug text-brand-dark md:text-base"
            title={productName ?? undefined}
          >
            {productName || '—'}
          </span>
        </SummaryColumn>
        <SummaryColumn label="Mã sản phẩm" dense className={cellBorder}>
          {productCode ? (
            <ProductIdCopy
              id={productCode}
              showLabel={false}
              size="sm"
              variant="compact"
              className="w-full [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-0 [&_button]:py-0 hover:[&_button]:border-0 hover:[&_button]:bg-transparent [&_button>span:first-child]:font-mono [&_button>span:first-child]:text-sm [&_button>span:first-child]:font-black [&_button>span:first-child]:tracking-tight [&_button>span:first-child]:text-brand-primary md:[&_button>span:first-child]:text-base"
            />
          ) : (
            <span className="text-sm font-bold text-gray-400">—</span>
          )}
        </SummaryColumn>
        <SummaryColumn label="Đã bán" value={soldCount != null ? String(soldCount) : '—'} dense className={cellBorder} />
        <SummaryColumn label="Mã voucher đang áp dụng" dense className={cellBorder}>
          {appliedVoucherCode && appliedVoucherId ? (
            <Link
              href={`/vouchers/${appliedVoucherId}`}
              className="truncate font-mono text-sm font-black tracking-tight text-brand-primary transition-colors hover:text-brand-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 rounded-sm md:text-base"
              title={`Xem chi tiết voucher: ${appliedVoucherCode}`}
            >
              {appliedVoucherCode}
            </Link>
          ) : (
            <span
              className={cn(
                'truncate font-mono text-sm font-black tracking-tight md:text-base',
                appliedVoucherCode ? 'text-brand-primary' : 'font-bold text-gray-400',
              )}
              title={appliedVoucherCode ?? undefined}
            >
              {appliedVoucherCode ?? '—'}
            </span>
          )}
        </SummaryColumn>
        <SummaryColumn label="Loại sản phẩm" value={typeLabel} dense className={cellBorder} />
        <SummaryColumn label="Thương hiệu" value={brand || '—'} dense className={cellBorder} />
        <SummaryColumn label="Xuất xứ" value={origin || '—'} dense className={cellBorder} />
        <SummaryColumn
          label={discountLabel ? 'Nhãn / Giảm giá' : 'Nhãn sản phẩm'}
          dense
          className={cellBorder}
        >
          {badgeLabel || discountLabel ? (
            <span className="flex min-w-0 flex-wrap items-center gap-1.5">
              {badgeLabel && (
                <span
                  className={cn(
                    'inline-flex max-w-full shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm md:text-xs',
                    getStorefrontProductBadgeClass(badgeType),
                  )}
                  title={badgeLabel}
                >
                  <span className="truncate">{badgeLabel}</span>
                </span>
              )}
              {discountLabel && (
                <span className={cn('shrink-0', getPreviewDiscountPctClass('desktop', 'pdp'))}>
                  {discountLabel}
                </span>
              )}
            </span>
          ) : (
            <span className="text-sm font-bold text-gray-400">—</span>
          )}
        </SummaryColumn>
      </div>
    </section>
  );
}

/** @param {{ label: string, value?: string, highlight?: boolean, mono?: boolean, fill?: boolean, dense?: boolean, labelNormalCase?: boolean, className?: string, children?: React.ReactNode }} props */
function SummaryColumn({
  label,
  value,
  highlight = false,
  mono = false,
  fill = false,
  dense = false,
  labelNormalCase = false,
  className,
  children,
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col',
        dense ? 'gap-0.5 px-3 py-2' : 'gap-1.5 px-4 py-4 sm:py-5',
        fill ? 'min-h-0 justify-start' : 'justify-center',
        className,
      )}
    >
      <span
        className={cn(
          'shrink-0 text-[13px] font-semibold leading-none tracking-wide text-gray-400',
          labelNormalCase ? 'normal-case' : 'uppercase',
        )}
      >
        {label}
      </span>
      {fill ? (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        children ?? (
          <span
            className={cn(
              'truncate text-sm font-bold text-brand-dark md:text-base',
              highlight && 'text-brand-primary',
              mono && 'font-mono text-xs font-medium md:text-sm',
            )}
            title={value}
          >
            {value}
          </span>
        )
      )}
    </div>
  );
}
