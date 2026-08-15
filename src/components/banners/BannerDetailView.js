import OptimizedImage from '@/components/common/OptimizedImage';
import BannerStatusBadge from '@/components/banners/BannerStatusBadge';
import BannerRowActions from '@/components/banners/BannerRowActions';
import { getBannerPlacementLabel } from '@/lib/banners/bannerDisplay';
import {
  BANNER_DESKTOP_IMAGE,
  BANNER_MOBILE_IMAGE,
  BANNER_DESKTOP_ASPECT_CLASS,
  BANNER_MOBILE_ASPECT_CLASS,
  CATEGORY_STRIP_DESKTOP_IMAGE,
  CATEGORY_STRIP_MOBILE_IMAGE,
  CATEGORY_STRIP_DESKTOP_ASPECT_CLASS,
  CATEGORY_STRIP_MOBILE_ASPECT_CLASS,
} from '@/lib/banners/bannerImageSpecs';

/**
 * @param {{ banner: object, canUpdate?: boolean, canDelete?: boolean }} props
 */
export default function BannerDetailView({
  banner,
  canUpdate = false,
  canDelete = false,
}) {
  const id = String(banner._id);
  const isCategoryStrip = banner.banner_kind === 'category_strip';
  const desktopSpec = isCategoryStrip ? CATEGORY_STRIP_DESKTOP_IMAGE : BANNER_DESKTOP_IMAGE;
  const mobileSpec = isCategoryStrip ? CATEGORY_STRIP_MOBILE_IMAGE : BANNER_MOBILE_IMAGE;
  const desktopAspect = isCategoryStrip ? CATEGORY_STRIP_DESKTOP_ASPECT_CLASS : BANNER_DESKTOP_ASPECT_CLASS;
  const mobileAspect = isCategoryStrip ? CATEGORY_STRIP_MOBILE_ASPECT_CLASS : BANNER_MOBILE_ASPECT_CLASS;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-brand-dark">
                {banner.banner_title || `Slide #${banner.banner_sort_order ?? 0}`}
              </h2>
              <BannerStatusBadge banner={banner} />
            </div>
            <p className="mt-1 text-sm text-gray-500">{getBannerPlacementLabel(banner)}</p>
          </div>
          <BannerRowActions
            bannerId={id}
            banner={banner}
            canUpdate={canUpdate}
            canDelete={canDelete}
            hideDetailLink
          />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Thứ tự</dt>
            <dd className="mt-1 text-sm font-bold text-brand-dark">{banner.banner_sort_order ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Link</dt>
            <dd className="mt-1 font-mono text-sm text-brand-primary break-all">
              {banner.banner_link || 'Không có link'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-brand-dark">Ảnh desktop</h3>
          <div className={`relative ${desktopAspect} w-full overflow-hidden rounded-lg bg-brand-gray`}>
            {banner.banner_desktop_url ? (
              <OptimizedImage
                src={banner.banner_desktop_url}
                alt="Banner desktop"
                preset="bannerAdmin"
                sizes="(max-width: 1024px) 100vw, 800px"
                width={desktopSpec.width}
                height={desktopSpec.height}
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-brand-dark">Ảnh mobile</h3>
          <div className={`relative mx-auto ${mobileAspect} w-full max-w-[280px] overflow-hidden rounded-lg bg-brand-gray`}>
            {banner.banner_mobile_url ? (
              <OptimizedImage
                src={banner.banner_mobile_url}
                alt="Banner mobile"
                preset="bannerAdmin"
                sizes="280px"
                width={mobileSpec.width}
                height={mobileSpec.height}
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
