'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
import BannerStatusBadge from '@/components/banners/BannerStatusBadge';
import BannerRowActions from '@/components/banners/BannerRowActions';
import { getBannerPlacementLabel, getBannerStatusKey } from '@/lib/banners/bannerDisplay';
import { getVoucherCardTheme } from '@/lib/vouchers/voucherLifecycleUi';
import { cn } from '@/lib/shared/utils';

/**
 * Card tóm tắt banner — mobile list, pattern VoucherSummaryCard (dense).
 *
 * @param {{
 *   banner: object,
 *   href?: string,
 *   showActions?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   className?: string,
 * }} props
 */
export default function BannerSummaryCard({
  banner,
  href,
  showActions = false,
  canUpdate = false,
  canDelete = false,
  className,
}) {
  const id = String(banner._id);
  const detailHref = href ?? `/banners/${id}`;
  const lifecycle = getBannerStatusKey(banner);
  const cardTheme = getVoucherCardTheme(lifecycle);
  const thumb = banner.banner_mobile_url || banner.banner_desktop_url;
  const title = banner.banner_title || `Slide #${banner.banner_sort_order ?? 0}`;

  return (
    <article
      data-banner-lifecycle={lifecycle}
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-sm',
        cardTheme.border,
        cardTheme.bg,
        detailHref && 'cursor-pointer transition-shadow hover:shadow-md',
        detailHref && cardTheme.hoverBorder,
        className,
      )}
    >
      {detailHref && (
        <Link
          href={detailHref}
          className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
          aria-label={`Xem chi tiết slide ${title}`}
        />
      )}

      <div className={cn('relative z-[1]', detailHref && 'pointer-events-none')}>
        <div className={cn('py-2', cardTheme.header)}>
          <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-[minmax(0,1fr)_auto_auto] md:divide-x md:divide-y-0 md:items-stretch">
            <div className="flex min-w-0 items-start gap-2 px-3 py-2">
              <div className="relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-md bg-brand-gray">
                {thumb ? (
                  <OptimizedImage
                    src={thumb}
                    alt=""
                    preset="thumb"
                    sizes="72px"
                    width={72}
                    height={56}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <BannerStatusBadge banner={banner} dense />
                <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-tight text-brand-dark">
                  {title}
                </h2>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {getBannerPlacementLabel(banner)}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center px-3 py-2 text-center md:min-w-[5.5rem]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Thứ tự</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-dark">
                {banner.banner_sort_order ?? 0}
              </p>
            </div>

            <div
              className={cn(
                'flex flex-col justify-center px-3 py-2 md:items-end md:text-right',
                detailHref && 'pointer-events-auto',
              )}
            >
              {showActions && (canUpdate || canDelete) && (
                <BannerRowActions
                  bannerId={id}
                  banner={banner}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  layout="row"
                  hideDetailLink
                  compact
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200" />

        <div className="grid grid-cols-1 divide-y divide-gray-200 px-3 py-2 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="min-w-0 py-1 sm:pr-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Link</p>
            <p className="mt-0.5 truncate font-mono text-xs text-gray-600">
              {banner.banner_link || 'Không có link'}
            </p>
          </div>
          <div className="min-w-0 py-1 sm:pl-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Vị trí</p>
            <p className="mt-0.5 truncate text-xs font-medium text-brand-dark">
              {getBannerPlacementLabel(banner)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
