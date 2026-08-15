export default function VoucherDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-5">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-8 lg:items-start">
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex gap-3">
              <div className="h-16 w-[88px] shrink-0 rounded-xl bg-gray-100" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-6 w-2/3 rounded bg-gray-200" />
                <div className="h-5 w-32 rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-16 rounded bg-gray-100" />
                  <div className="h-4 w-28 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-28 rounded-xl bg-gray-100" />
        </div>
        <div className="h-80 rounded-xl bg-gray-100 lg:col-span-3" />
      </div>
    </div>
  );
}
