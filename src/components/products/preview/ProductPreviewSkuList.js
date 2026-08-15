import { cn, formatCurrency } from '@/lib/shared/utils';
import { buildSkuTierLabel, getSkuKey, resolveProductCardPricing } from '@/lib/products/productPreview';

/**
 * Danh sách SKU read-only — card layout, có thể chọn để đồng bộ gallery.
 *
 * @param {{
 *   skus: object[],
 *   variations: object[],
 *   layout?: 'default' | 'stack',
 *   selectable?: boolean,
 *   selectedSkuKey?: string,
 *   onSelectSku?: (sku: object) => void,
 * }} props
 */
export default function ProductPreviewSkuList({
  skus = [],
  variations = [],
  layout = 'default',
  selectable = false,
  selectedSkuKey,
  onSelectSku,
}) {
  if (!skus.length) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
        Chưa có biến thể SKU
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {skus.map((sku) => {
        const label = buildSkuTierLabel(sku, variations);
        const skuKey = getSkuKey(sku);
        const isSelected = selectable && selectedSkuKey === skuKey;
        const { displayPrice, displaySale } = resolveProductCardPricing(sku, {});
        const finalPrice = displaySale ?? displayPrice;
        const hasDiscount = displaySale != null;

        const cardClassName = cn(
          'min-w-0 rounded-xl border-2 bg-white px-2 py-2 text-left transition-colors md:px-2.5 md:py-2.5',
          isSelected
            ? 'border-brand-primary ring-2 ring-brand-primary/25'
            : sku.is_default
              ? 'border-brand-primary/30'
              : 'border-gray-200',
          selectable && !isSelected && 'hover:border-brand-primary/50 cursor-pointer',
        );

        const imageCount = sku.sku_images?.length ?? 0;
        const hasVideo = Boolean(sku.sku_videos?.[0]);

        const mediaBadges = (
          <>
            {imageCount > 0 && (
              <span className="ml-1.5 shrink-0 rounded-full bg-brand-gray px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
                {imageCount} ảnh
              </span>
            )}
            {hasVideo && (
              <span className="ml-1.5 shrink-0 rounded-full bg-brand-gray px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
                1 video
              </span>
            )}
          </>
        );

        const cardBody = (
          <>
            <div className="min-w-0 space-y-1">
              <InlineFieldRow
                label="Phân loại"
                value={label}
                valueClassName="text-sm font-semibold text-brand-dark break-words"
                trailing={
                  <>
                    {sku.is_default && (
                      <span className="ml-1.5 shrink-0 rounded-full bg-brand-primary px-2 py-0.5 text-[9px] font-semibold uppercase text-white">
                        Mặc định
                      </span>
                    )}
                    {!sku.sku_code && mediaBadges}
                  </>
                }
              />
              {sku.sku_code && (
                <InlineFieldRow
                  label="Mã SKU"
                  value={sku.sku_code}
                  valueClassName="font-mono text-[15px] font-semibold leading-snug text-gray-600 break-all"
                  trailing={mediaBadges}
                />
              )}
            </div>

            <div className={cn(
              'mt-2 grid grid-cols-2 gap-x-2 gap-y-1',
              layout === 'default' && 'lg:grid-cols-4',
            )}>
              <MetaItem label="Giá gốc" value={formatCurrency(displayPrice)} />
              <MetaItem
                label="Giá bán"
                value={formatCurrency(finalPrice)}
                highlight={hasDiscount}
              />
              <MetaItem label="Tồn kho" value={String(sku.sku_stock ?? 0)} />
              <MetaItem
                label="Trạng thái"
                value={(sku.sku_stock ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                muted={(sku.sku_stock ?? 0) <= 0}
                compactLabel
              />
            </div>
          </>
        );

        if (selectable) {
          return (
            <div
              key={skuKey || label}
              role="button"
              tabIndex={0}
              onClick={() => onSelectSku?.(sku)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSku?.(sku);
                }
              }}
              className={cn(cardClassName, 'w-full')}
              aria-pressed={isSelected}
            >
              {cardBody}
            </div>
          );
        }

        return (
          <article key={skuKey || label} className={cardClassName}>
            {cardBody}
          </article>
        );
      })}
    </div>
  );
}

/**
 * Label + value trên cùng một dòng (inline), tránh block layout trong button.
 *
 * @param {{
 *   label: string,
 *   value: string,
 *   valueClassName?: string,
 *   trailing?: import('react').ReactNode,
 * }} props
 */
function InlineFieldRow({ label, value, valueClassName, trailing = null }) {
  return (
    <p className="min-w-0 leading-snug">
      <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className={cn('ml-1.5', valueClassName)}>{value}</span>
      {trailing}
    </p>
  );
}

/** @param {{ label: string, value: string, highlight?: boolean, muted?: boolean, compactLabel?: boolean }} props */
function MetaItem({ label, value, highlight = false, muted = false, compactLabel = false }) {
  return (
    <p className="min-w-0 whitespace-nowrap leading-snug">
      <span
        className={cn(
          'font-medium uppercase text-gray-400',
          compactLabel
            ? 'text-[8px] tracking-normal'
            : 'text-[10px] tracking-wide',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'ml-1 text-sm font-semibold tabular-nums',
          highlight && 'text-rose-600',
          muted && 'text-amber-700',
          !highlight && !muted && 'text-brand-dark',
        )}
      >
        {value}
      </span>
    </p>
  );
}
