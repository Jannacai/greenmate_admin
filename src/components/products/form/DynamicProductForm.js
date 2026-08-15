'use client';

import dynamic from 'next/dynamic';
import ProductFormSkeleton from '@/components/products/form/ProductFormSkeleton';

const ProductForm = dynamic(() => import('@/components/products/form/ProductForm'), {
  loading: () => <ProductFormSkeleton />,
  ssr: false,
});

/**
 * ProductForm tải lazy — tách bundle client nặng khỏi page shell.
 * @param {import('@/components/products/form/ProductForm').default extends React.ComponentType<infer P> ? P : never} props
 */
export default function DynamicProductForm(props) {
  return <ProductForm {...props} />;
}
