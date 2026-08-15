'use client';

import dynamic from 'next/dynamic';
import ProductFormSkeleton from '@/components/products/form/ProductFormSkeleton';

const CategoryForm = dynamic(() => import('@/components/categories/CategoryForm'), {
  loading: () => <ProductFormSkeleton />,
  ssr: false,
});

/** @param {import('@/components/categories/CategoryForm').default extends React.ComponentType<infer P> ? P : never} props */
export default function DynamicCategoryForm(props) {
  return <CategoryForm {...props} />;
}
