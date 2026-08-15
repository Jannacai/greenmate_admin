export default function VouchersLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-28 rounded bg-gray-200" />
          <div className="h-3 w-64 rounded bg-gray-100" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-gray-200" />
      </div>
      <div className="mb-4 h-10 rounded-lg bg-gray-100" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-4 py-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-3 w-40 rounded bg-gray-100" />
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
