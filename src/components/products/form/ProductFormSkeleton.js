/**
 * Skeleton form SP — dùng cho loading.js và dynamic() ProductForm.
 */
export default function ProductFormSkeleton() {
  return (
    <div className="min-w-0 animate-pulse overflow-x-hidden">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_272px]">
        <aside className="order-1 space-y-4 lg:order-2">
          <div className="rounded-xl border border-gray-200 bg-white h-52" />
          <div className="rounded-xl border border-gray-200 bg-white h-56" />
        </aside>
        <div className="order-2 space-y-5 lg:order-1">
          <div className="rounded-xl border border-gray-200 bg-white h-40" />
          <div className="rounded-xl border border-gray-200 bg-white h-48" />
          <div className="rounded-xl border border-gray-200 bg-white h-64" />
        </div>
      </div>
    </div>
  );
}
