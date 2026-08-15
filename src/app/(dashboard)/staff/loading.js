export default function StaffLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 animate-pulse">
      <div className="flex justify-between gap-4">
        <div className="h-8 w-36 rounded-lg bg-gray-200" />
        <div className="h-9 w-36 rounded-lg bg-gray-200" />
      </div>
      <div className="h-16 rounded-lg bg-gray-100" />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-0">
            <div className="h-8 w-8 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-40 rounded bg-gray-100" />
              <div className="h-3 w-56 rounded bg-gray-50" />
            </div>
          </div>
        ))}
        <div className="h-12 border-t border-gray-100 bg-gray-50" />
      </div>
    </div>
  );
}
