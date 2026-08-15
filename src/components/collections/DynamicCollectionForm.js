'use client';

import dynamic from 'next/dynamic';
import ProductFormSkeleton from '@/components/products/form/ProductFormSkeleton';

const CollectionForm = dynamic(() => import('@/components/collections/CollectionForm'), {
  loading: () => <ProductFormSkeleton />,
  ssr: false,
});

/** @param {import('@/components/collections/CollectionForm').default extends React.ComponentType<infer P> ? P : never} props */
export default function DynamicCollectionForm(props) {
  return <CollectionForm {...props} />;
}
