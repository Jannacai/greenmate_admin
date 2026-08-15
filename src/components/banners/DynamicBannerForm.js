'use client';

import dynamic from 'next/dynamic';
import ProductFormSkeleton from '@/components/products/form/ProductFormSkeleton';

const HeroBannerForm = dynamic(() => import('@/components/banners/HeroBannerForm'), {
  loading: () => <ProductFormSkeleton />,
  ssr: false,
});

const CategoryStripBannerForm = dynamic(
  () => import('@/components/banners/CategoryStripBannerForm'),
  { loading: () => <ProductFormSkeleton />, ssr: false },
);

/**
 * @param {{
 *   variant: 'hero' | 'category',
 *   mode: 'create' | 'edit',
 *   bannerId?: string,
 *   initial?: object | null,
 *   canSubmit?: boolean,
 *   cancelHref?: string,
 *   defaultPlacement?: string,
 * }} props
 */
export default function DynamicBannerForm({ variant = 'hero', ...props }) {
  if (variant === 'category') {
    return <CategoryStripBannerForm {...props} />;
  }
  return <HeroBannerForm {...props} />;
}
