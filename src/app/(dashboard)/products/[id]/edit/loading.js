import ProductFormSkeleton from '@/components/products/form/ProductFormSkeleton';

export default function EditProductLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-3 animate-pulse">
        <div className="h-9 w-9 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-3 w-56 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-gray-100" />
      </div>
      <ProductFormSkeleton />
    </div>
  );
}
