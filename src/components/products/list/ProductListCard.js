import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
import ProductMerchBadge from '@/components/products/shared/ProductMerchBadge';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import ProductRowActions from '@/components/products/list/ProductRowActions';
import ProductIdCopy from '@/components/products/shared/ProductIdCopy';
import ProductPriceHoverCard from '@/components/products/shared/ProductPriceHoverCard';
import ProductStatusBadge from '@/components/products/shared/ProductStatusBadge';
import { getProductListMeta } from '@/lib/products/productDisplay';
import { formatCurrency, formatDate, cn } from '@/lib/shared/utils';
import {
  PRODUCT_TABLE_CELL_BASE,
  PRODUCT_TABLE_COL,
  PRODUCT_TABLE_DIVIDER,
} from '@/components/products/list/productListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

/**
 * Card sản phẩm — mobile: card; desktop (row): `<tr>` trong bảng.
 *
 * @param {{
 *   product: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   desktopVariant?: 'card' | 'row',
 *   rowIndex?: number,
 * }} props
 */
export default function ProductListCard({
  product,
  canUpdate = false,
  canDelete = false,
  desktopVariant = 'card',
  rowIndex = 0,
}) {
  const meta = getProductListMeta(product);
  const previewHref = `/products/${meta.id}?status=${meta.status}`;
  const thumb = product.product_thumb;

  const basePrice = meta.priceBase > 0 ? meta.priceBase : meta.price;
  const salePrice = meta.hasDiscount && meta.price > 0 && meta.price < basePrice
    ? meta.price
    : null;

  if (desktopVariant === 'row') {
    return (
      <ProductListCardNav
        as="tr"
        href={previewHref}
        data-product-status={meta.status}
        className={cn(
          getAdminListRowZebraClass(rowIndex),
          ADMIN_LIST_ROW_HOVER_CLASS,
          meta.status === 'published'
            ? 'shadow-[inset_3px_0_0_0_#4ade80]'
            : 'shadow-[inset_3px_0_0_0_#d1d5db]',
        )}
      >
        <td className={cn(PRODUCT_TABLE_CELL_BASE, PRODUCT_TABLE_COL.product)}>
          <div className="flex min-w-0 items-center gap-2">
            <ProductThumb thumb={thumb} alt={product.product_name} size="sm" />
            <div className="min-w-0 flex-1">
              <ProductTitleBlock
                product={product}
                meta={meta}
                detailHref={previewHref}
                tableLayout
              />
            </div>
          </div>
        </td>
        <td className={cn(PRODUCT_TABLE_CELL_BASE, PRODUCT_TABLE_COL.productCode, PRODUCT_TABLE_DIVIDER, 'text-center')}>
          <ProductCodeCell productCode={meta.productCode} />
        </td>
        <td className={cn(PRODUCT_TABLE_CELL_BASE, PRODUCT_TABLE_COL.priceSale, PRODUCT_TABLE_DIVIDER, 'text-center')}>
          <ProductListPriceValue
            value={salePrice}
            emphasize
          />
        </td>
        <td className={cn(PRODUCT_TABLE_CELL_BASE, PRODUCT_TABLE_COL.priceBase, PRODUCT_TABLE_DIVIDER, 'text-center')}>
          <ProductListPriceValue
            value={basePrice}
            strike={Boolean(salePrice)}
          />
        </td>
        <td className={cn(PRODUCT_TABLE_CELL_BASE, PRODUCT_TABLE_COL.pill, PRODUCT_TABLE_DIVIDER, 'text-center')}>
          <TypeBadge typeBadge={meta.typeBadge} tablePill />
        </td>
        <td className={cn(PRODUCT_TABLE_CELL_BASE, PRODUCT_TABLE_COL.sold, PRODUCT_TABLE_DIVIDER, 'text-center')}>
          <ProductSoldColumn quantitySold={meta.quantitySold} compact />
        </td>
        <td className={cn(PRODUCT_TABLE_CELL_BASE, PRODUCT_TABLE_COL.pill, PRODUCT_TABLE_DIVIDER, 'text-center')}>
          <ProductStatusBadge
            status={meta.status}
            plain
            className="justify-center whitespace-nowrap"
          />
        </td>
        <td className={cn(PRODUCT_TABLE_CELL_BASE, PRODUCT_TABLE_COL.actions, PRODUCT_TABLE_DIVIDER, 'text-center')}>
          <ProductRowActions
            productId={meta.id}
            productName={product.product_name}
            status={meta.status}
            canUpdate={canUpdate}
            canDelete={canDelete}
            layout="row"
          />
        </td>
      </ProductListCardNav>
    );
  }

  return (
    <ProductListCardNav
      href={previewHref}
      data-product-status={meta.status}
      className={cn(
        'relative rounded-lg border border-gray-200 bg-white transition-[box-shadow,border-color] hover:shadow-sm',
        meta.status === 'published'
          ? 'shadow-[inset_3px_0_0_0_#4ade80]'
          : 'shadow-[inset_3px_0_0_0_#d1d5db]',
      )}
    >
      <div className="px-2.5 py-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <div className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-0.5 rounded-md border border-gray-100 bg-brand-light/60 px-2 py-1.5">
              <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">Giá gốc</span>
              <span className="text-[9px] font-medium uppercase tracking-wide text-gray-500">Giá KM</span>
              <ProductListPriceValue value={basePrice} strike={Boolean(salePrice)} />
              <ProductListPriceValue value={salePrice} emphasize />
            </div>
            <div className="min-w-0 flex-1">
              <ProductTitleBlock
                product={product}
                meta={meta}
                detailHref={previewHref}
                thumb={thumb}
                showThumb
              />
              <ProductCodeRow productCode={meta.productCode} className="mt-1" compact />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-dashed border-gray-200/80 pt-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500">
              <p>
                Cập nhật{' '}
                <span className="font-medium text-gray-600 tabular-nums">
                  {product.updatedAt ? formatDate(product.updatedAt, 'datetime') : '—'}
                </span>
              </p>
              <ProductSoldInline quantitySold={meta.quantitySold} />
            </div>
            <ProductRowActions
              productId={meta.id}
              productName={product.product_name}
              status={meta.status}
              canUpdate={canUpdate}
              canDelete={canDelete}
              layout="row"
            />
          </div>
        </div>
      </div>
    </ProductListCardNav>
  );
}

/**
 * @param {{
 *   value?: number | null,
 *   emphasize?: boolean,
 *   strike?: boolean,
 * }} props
 */
function ProductListPriceValue({ value, emphasize = false, strike = false }) {
  if (!value || value <= 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <span
      className={cn(
        'block text-xs font-semibold tabular-nums whitespace-nowrap',
        strike && 'font-medium text-gray-400 line-through',
        emphasize && !strike && 'text-brand-dark',
        !emphasize && !strike && 'text-brand-dark',
      )}
    >
      {formatCurrency(value)}
    </span>
  );
}

/**
 * @param {{
 *   product: object,
 *   meta: object,
 *   thumb?: string,
 *   showThumb?: boolean,
 *   tableLayout?: boolean,
 *   detailHref: string,
 * }} props
 */
function ProductTitleBlock({
  product,
  meta,
  thumb,
  showThumb = false,
  tableLayout = false,
  detailHref,
}) {
  const titleLink = (
    <ProductPriceHoverCard
      product={product}
      className={cn('max-w-full', tableLayout ? 'min-w-0 w-full' : 'w-fit')}
    >
      <Link
        href={detailHref}
        title={tableLayout ? product.product_name : undefined}
        className={cn(
          'block font-bold text-brand-dark transition-colors hover:text-brand-primary group-hover/card:text-brand-primary',
          tableLayout
            ? 'min-w-0 text-[13px] font-semibold leading-snug truncate'
            : showThumb
              ? 'min-w-0 max-w-full text-[13px] font-semibold leading-snug line-clamp-2'
              : 'max-w-full truncate text-[13px] font-semibold',
        )}
      >
        {product.product_name}
      </Link>
    </ProductPriceHoverCard>
  );

  return (
    <>
      {!tableLayout && (
        <div className="flex flex-wrap items-center gap-1.5">
          <ProductStatusBadge status={meta.status} />
          <TypeBadge typeBadge={meta.typeBadge} />
          {meta.merchBadge && <ProductMerchBadge badge={meta.merchBadge} />}
        </div>
      )}
      {tableLayout ? (
        <div className="min-w-0">{titleLink}</div>
      ) : showThumb && thumb ? (
        <div className="mt-1 flex items-start gap-2">
          {titleLink}
          <ProductThumb thumb={thumb} alt={product.product_name} size="sm" className="shrink-0" />
        </div>
      ) : (
        <div className="mt-0.5">{titleLink}</div>
      )}
    </>
  );
}

/** @param {{ typeBadge: { label: string, className: string, tableTextClass?: string }, tablePill?: boolean }} props */
function TypeBadge({ typeBadge, tablePill = false }) {
  if (tablePill) {
    return (
      <span
        className="text-xs font-semibold text-brand-dark whitespace-nowrap"
        title={typeBadge.label}
      >
        {typeBadge.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1',
        typeBadge.className,
      )}
    >
      {typeBadge.label}
    </span>
  );
}

/**
 * @param {{ thumb?: string, alt: string, size?: 'sm' | 'md', className?: string }} props
 */
function ProductThumb({ thumb, alt, size = 'md', className }) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const px = size === 'sm' ? 32 : 36;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50',
        dim,
        className,
      )}
    >
      {thumb ? (
        <OptimizedImage
          src={thumb}
          alt={alt}
          preset="thumb"
          sizes={`${px}px`}
          width={px}
          height={px}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
          </svg>
        </div>
      )}
    </div>
  );
}

/** @param {{ productCode: string | null, className?: string }} props */
function ProductCodeCell({ productCode, className }) {
  if (!productCode) {
    return <span className={cn('text-xs text-gray-400', className)}>—</span>;
  }

  return (
    <div data-card-nav-block className={cn('flex justify-center', className)}>
      <ProductIdCopy
        id={productCode}
        plain
        showLabel={false}
        className="w-fit max-w-full"
      />
    </div>
  );
}

/** @param {{ productCode: string | null, className?: string, compact?: boolean }} props */
function ProductCodeRow({ productCode, className, compact = false }) {
  if (!productCode) {
    return <span className={cn('text-[11px] text-gray-400', className)}>—</span>;
  }

  return (
    <div data-card-nav-block className={cn('flex min-w-0 items-center gap-1.5', className)}>
      {!compact && (
        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
          Mã sản phẩm
        </span>
      )}
      <ProductIdCopy
        id={productCode}
        plain
        showLabel={false}
        className="w-fit max-w-full shrink-0"
      />
    </div>
  );
}

/** @param {{ quantitySold: number, compact?: boolean }} props */
function ProductSoldColumn({ quantitySold, compact = false }) {
  const soldLabel = quantitySold.toLocaleString('vi-VN');

  return (
    <>
      {!compact && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Đã bán</p>
      )}
      <p
        className={cn(
          'text-xs font-semibold leading-snug tabular-nums whitespace-nowrap',
          !compact && 'mt-0.5',
          quantitySold > 0 ? 'text-brand-primary' : 'text-gray-500',
        )}
      >
        {soldLabel}
      </p>
    </>
  );
}

/** @param {{ quantitySold: number }} props */
function ProductSoldInline({ quantitySold }) {
  const soldLabel = quantitySold.toLocaleString('vi-VN');

  return (
    <p>
      Đã bán{' '}
      <span
        className={cn(
          'font-semibold tabular-nums',
          quantitySold > 0 ? 'text-brand-primary' : 'text-gray-500',
        )}
      >
        {soldLabel}
      </span>
    </p>
  );
}
