'use client';

import { ListFilterPanel } from '@/components/admin';

const KIND_TABS = [
  {
    key: 'hero_slider',
    countKey: 'hero_slider',
    label: 'Slider hero',
    hint: 'Hero slider đầu trang — trang chủ, hạt dinh dưỡng, sữa hạt',
  },
  {
    key: 'category_strip',
    countKey: 'category_strip',
    label: 'Banner danh mục',
    hint: 'Strip CTA gắn danh mục cấp 1 hoặc cấp 2',
  },
];

/**
 * @param {{
 *   kindStats?: { hero_slider?: number, category_strip?: number },
 * }} props
 */
export default function BannerFilterBar({ kindStats }) {
  return (
    <ListFilterPanel
      statusTabs={{
        tabs: KIND_TABS,
        counts: kindStats,
        paramName: 'kind',
        sectionLabel: 'Lọc theo loại banner',
      }}
    />
  );
}
