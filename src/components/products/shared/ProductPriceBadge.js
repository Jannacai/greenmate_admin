import { cn, formatCurrency } from '@/lib/shared/utils';
import VoucherCodePillCopy from '@/components/vouchers/VoucherCodePillCopy';
import { PRODUCT_CARD_DISCOUNT_PCT_CLASS } from '@/lib/products/variationDisplay';

/**
 * @param {{ label: string, value: number, emphasize?: boolean, strike?: boolean, size?: 'sm' | 'md' }} props
 */
function PriceLine({ label, value, emphasize = false, strike = false, size = 'md' }) {
  if (!value || value <= 0) return null;

  return (
    <div className="flex items-baseline justify-between gap-2 text-left">
      <span className="shrink-0 text-[9px] font-medium text-gray-500 md:text-[10px]">{label}</span>
      <span
        className={cn(
          'tabular-nums',
          size === 'sm' ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm',
          emphasize && 'font-bold text-brand-dark',
          strike && 'text-gray-400 line-through',
          !emphasize && !strike && 'font-medium text-gray-600',
        )}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

/**
 * Badge giá admin — giá gốc và giá khách thấy (sau voucher hoặc SKU sale).
 *
 * @param {{
 *   price?: number,
 *   basePrice?: number,
 *   pricePreVoucher?: number,
 *   hasDiscount?: boolean,
 *   discountSource?: 'voucher' | 'sku_sale' | null,
 *   discountPercent?: number,
 *   voucherCode?: string | null,
 *   voucherName?: string | null,
 *   size?: 'sm' | 'md',
 *   className?: string,
 * }} props
 */
export default function ProductPriceBadge({
  price = 0,
  basePrice = 0,
  pricePreVoucher = 0,
  hasDiscount = false,
  discountSource = null,
  discountPercent = 0,
  voucherCode = null,
  voucherName = null,
  size = 'md',
  className,
}) {
  const preVoucher = pricePreVoucher > 0 ? pricePreVoucher : basePrice;
  const isVoucher = discountSource === 'voucher';
  const isSkuSale = discountSource === 'sku_sale';
  const showVoucherBreakdown = isVoucher && basePrice > 0 && price > 0 && (basePrice > price || preVoucher > price);
  const showSkuBreakdown = isSkuSale && basePrice > 0 && price > 0 && basePrice > price;
  const showPlain = !showVoucherBreakdown && !showSkuBreakdown;

  const boxClass = showVoucherBreakdown
    ? 'bg-rose-50 ring-rose-200'
    : showSkuBreakdown
      ? 'bg-amber-50 ring-amber-200'
      : 'bg-brand-light ring-gray-200';

  const padding = size === 'sm' ? 'min-w-0 px-2 py-1' : 'min-w-[168px] px-3 py-2.5';

  return (
    <div className={cn('flex shrink-0 flex-col gap-0.5', className)}>
      <div className={cn(size === 'sm' ? 'rounded-lg ring-1' : 'rounded-xl ring-1', boxClass, padding)}>
        {showVoucherBreakdown ? (
          <div className={cn(size === 'sm' ? 'space-y-0.5' : 'space-y-1')}>
            {basePrice > price && (
              <PriceLine label="Giá gốc" value={basePrice} strike size={size} />
            )}
            <PriceLine label="Sau voucher" value={price} emphasize size={size} />
            {(discountPercent > 0 || voucherCode) && (
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                {voucherCode ? (
                  <VoucherCodePillCopy code={voucherCode} name={voucherName} />
                ) : (
                  <span />
                )}
                {discountPercent > 0 && (
                  <span className={cn('shrink-0 text-[9px] md:text-[10px]', PRODUCT_CARD_DISCOUNT_PCT_CLASS)}>
                    −{discountPercent}%
                  </span>
                )}
              </div>
            )}
          </div>
        ) : showSkuBreakdown ? (
          <div className="space-y-1">
            <PriceLine label="Giá gốc" value={basePrice} strike size={size} />
            <PriceLine label="Giá SKU sale" value={price} emphasize size={size} />
            {discountPercent > 0 && (
              <p className="pt-0.5 text-right">
                <span className={cn('text-[9px] md:text-[10px]', PRODUCT_CARD_DISCOUNT_PCT_CLASS)}>
                  −{discountPercent}% SKU
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <PriceLine
              label={hasDiscount ? 'Giá khách' : 'Giá bán'}
              value={price || basePrice}
              emphasize
              size={size}
            />
            {showPlain && hasDiscount && basePrice > price && (
              <PriceLine label="Giá gốc" value={basePrice} strike size={size} />
            )}
          </div>
        )}
      </div>

      {voucherCode && !showVoucherBreakdown && (
        <VoucherCodePillCopy
          code={voucherCode}
          name={voucherName}
          className="mx-auto block max-w-[148px] text-center"
        />
      )}
    </div>
  );
}
