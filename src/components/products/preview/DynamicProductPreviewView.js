'use client';

import dynamic from 'next/dynamic';

const ProductPreviewView = dynamic(
  () => import('@/components/products/preview/ProductPreviewView'),
  {
    loading: () => (
      <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="aspect-[4/5] rounded-xl bg-gray-100" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-gray-100" />
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-40 rounded-xl bg-gray-100" />
        </div>
      </div>
    ),
    ssr: false,
  },
);

/** @param {import('@/components/products/preview/ProductPreviewView').default extends React.ComponentType<infer P> ? P : never} props */
export default function DynamicProductPreviewView(props) {
  return <ProductPreviewView {...props} />;
}
