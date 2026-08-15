export default function ProductPreviewLoading() {
  return (
    <div className="mx-auto min-w-0 max-w-7xl animate-pulse overflow-x-hidden">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 rounded-lg bg-gray-200" />
        <div className="min-w-0 space-y-2">
          <div className="h-7 w-40 rounded bg-gray-200" />
          <div className="h-4 w-56 max-w-full rounded bg-gray-100" />
        </div>
      </div>

      <div className="space-y-5">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid grid-cols-1 divide-y divide-gray-100 border-b border-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-1 px-3 py-2">
                <div className="h-2.5 w-20 rounded bg-gray-100" />
                <div className="h-6 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 md:grid-cols-4 lg:grid-cols-7 lg:divide-y-0">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-1 px-3 py-2">
                <div className="h-2.5 w-16 rounded bg-gray-100" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="h-[480px] rounded-xl border border-gray-200 bg-white" />
          <div className="h-64 rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
