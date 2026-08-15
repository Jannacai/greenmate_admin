export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 sm:px-4">
        <div className="h-11 w-11 shrink-0 rounded-lg bg-gray-200" />
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="h-5 w-48 rounded bg-gray-200" />
          <div className="flex gap-1.5">
            <div className="h-8 w-20 rounded bg-gray-100" />
            <div className="h-8 w-24 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="flex gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
          <div className="h-8 w-24 rounded bg-gray-200" />
          <div className="h-8 w-28 rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {[0, 1, 2].map((col) => (
            <div key={col} className="border-b border-gray-100 lg:border-b-0 lg:border-r lg:border-gray-100">
              <div className="h-9 bg-[#e8e2db]" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex border-b border-gray-100">
                  <div className="h-10 w-32 shrink-0 bg-gray-50" />
                  <div className="h-10 flex-1 bg-white px-3 py-2">
                    <div className="h-4 w-full max-w-[10rem] rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
