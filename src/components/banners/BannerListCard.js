'use client';

import Link from 'next/link';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import OptimizedImage from '@/components/common/OptimizedImage';
import BannerStatusBadge from '@/components/banners/BannerStatusBadge';
import BannerRowActions from '@/components/banners/BannerRowActions';
import BannerSummaryCard from '@/components/banners/BannerSummaryCard';
import { getBannerPlacementLabel, getBannerStatusKey } from '@/lib/banners/bannerDisplay';
import { cn } from '@/lib/shared/utils';
import {
  BANNER_TABLE_CELL_BASE,
  BANNER_TABLE_COL,
  BANNER_TABLE_DIVIDER,
} from '@/components/banners/bannerListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

const LIFECYCLE_ROW_ACCENT = {
  active: 'shadow-[inset_3px_0_0_0_#4ade80]',
  inactive: 'shadow-[inset_3px_0_0_0_#d1d5db]',
};

/**
 * Card / hàng banner — mobile: summary card; desktop (row): `<tr>` trong bảng.
 *
 * @param {{
 *   banner: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   desktopVariant?: 'card' | 'row',
 *   rowIndex?: number,
 * }} props
 */
export function BannerListCard({
  banner,
  canUpdate = false,
  canDelete = false,
  desktopVariant = 'card',
  rowIndex = 0,
}) {
  const id = String(banner._id);
  const detailHref = `/banners/${id}`;
  const lifecycle = getBannerStatusKey(banner);
  const thumb = banner.banner_mobile_url || banner.banner_desktop_url;
  const title = banner.banner_title || `Slide #${banner.banner_sort_order ?? 0}`;

  if (desktopVariant === 'row') {
    return (
      <ProductListCardNav
        as="tr"
        href={detailHref}
        data-banner-lifecycle={lifecycle}
        className={cn(
          getAdminListRowZebraClass(rowIndex),
          ADMIN_LIST_ROW_HOVER_CLASS,
          LIFECYCLE_ROW_ACCENT[lifecycle] ?? LIFECYCLE_ROW_ACCENT.inactive,
        )}
      >
        <td className={cn(BANNER_TABLE_CELL_BASE, BANNER_TABLE_COL.slide)}>
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded-md bg-brand-gray">
              {thumb ? (
                <OptimizedImage
                  src={thumb}
                  alt=""
                  preset="thumb"
                  sizes="48px"
                  width={48}
                  height={32}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>
            <Link
              href={detailHref}
              data-card-nav-block
              title={`${title} · ${getBannerPlacementLabel(banner)}`}
              className="min-w-0 truncate text-xs font-semibold text-brand-dark hover:text-brand-primary hover:underline"
            >
              {title}
            </Link>
          </div>
        </td>
        <td className={cn(BANNER_TABLE_CELL_BASE, BANNER_TABLE_COL.sort, BANNER_TABLE_DIVIDER, 'text-center')}>
          <span className="text-xs font-semibold tabular-nums text-brand-dark whitespace-nowrap">
            {banner.banner_sort_order ?? 0}
          </span>
        </td>
        <td className={cn(BANNER_TABLE_CELL_BASE, BANNER_TABLE_COL.link, BANNER_TABLE_DIVIDER)}>
          <p
            className="truncate font-mono text-[10px] font-medium text-gray-600 md:text-xs"
            title={banner.banner_link || undefined}
          >
            {banner.banner_link || '—'}
          </p>
        </td>
        <td className={cn(BANNER_TABLE_CELL_BASE, BANNER_TABLE_COL.pill, BANNER_TABLE_DIVIDER, 'text-center')}>
          <BannerStatusBadge
            banner={banner}
            plain
            className="justify-center whitespace-nowrap"
          />
        </td>
        <td className={cn(BANNER_TABLE_CELL_BASE, BANNER_TABLE_COL.actions, BANNER_TABLE_DIVIDER, 'text-right')}>
          <BannerRowActions
            bannerId={id}
            banner={banner}
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
    <BannerSummaryCard
      banner={banner}
      href={detailHref}
      showActions
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  );
}
