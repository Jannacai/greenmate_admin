export default function CustomerDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 sm:px-4">
        <div className="h-11 w-11 shrink-0 rounded-lg bg-gray-200" />
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-100" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="flex gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
          <div className="h-8 w-36 rounded bg-gray-200" />
          <div className="h-8 w-40 rounded bg-gray-100" />
        </div>
        <div className="space-y-0 p-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex border-b border-gray-100">
              <div className="h-10 w-44 shrink-0 bg-gray-50" />
              <div className="h-10 flex-1 bg-white px-3 py-2">
                <div className="h-4 w-full max-w-md rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
