'use client';

import dynamic from 'next/dynamic';
import ProductFormSkeleton from '@/components/products/form/ProductFormSkeleton';

const VoucherForm = dynamic(() => import('@/components/vouchers/VoucherForm'), {
  loading: () => <ProductFormSkeleton />,
  ssr: false,
});

/** @param {import('@/components/vouchers/VoucherForm').default extends React.ComponentType<infer P> ? P : never} props */
export default function DynamicVoucherForm(props) {
  return <VoucherForm {...props} />;
}
