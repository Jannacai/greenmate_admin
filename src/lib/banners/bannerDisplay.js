import { getBannerLifecycleStatus, BANNER_PLACEMENT_LABELS } from '@/lib/banners/bannerSchema';

export const BANNER_STATUS_CONFIG = {
  active: {
    label: 'Đang hiển thị',
    dot: 'bg-green-600',
    text: 'text-green-800',
    className: 'bg-green-100 text-green-900 ring-green-300',
  },
  inactive: {
    label: 'Đã ẩn',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
};

/**
 * @param {object} banner
 */
export function getBannerPlacementLabel(banner) {
  if (banner?.banner_kind === 'category_strip') {
    const level = banner?.banner_category_level;
    const slug = banner?.banner_category_slug;
    if (level && slug) return `Strip danh mục L${level} — ${slug}`;
    return BANNER_PLACEMENT_LABELS.category_strip;
  }
  const key = banner?.banner_placement;
  return BANNER_PLACEMENT_LABELS[key] ?? key ?? '—';
}

/**
 * @param {object} banner
 */
export function getBannerStatusKey(banner) {
  return banner?.lifecycle_status ?? getBannerLifecycleStatus(banner);
}

/**
 * Map banner DB → shape HeroSlider FE (storefront sau này).
 * @param {object} banner
 */
export function mapBannerToHeroSlide(banner) {
  return {
    id: String(banner._id),
    desktopImg: banner.banner_desktop_url,
    mobileImg: banner.banner_mobile_url,
    link: banner.banner_link || null,
    title: banner.banner_title || '',
    sortOrder: banner.banner_sort_order ?? 0,
  };
}
