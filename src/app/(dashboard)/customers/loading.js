export default function CustomersLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 animate-pulse">
      <div className="h-8 w-32 rounded-lg bg-gray-200" />
      <div className="h-16 rounded-lg bg-gray-100" />
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-3 py-2.5 last:border-0">
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-40 rounded bg-gray-200" />
              <div className="h-3 w-56 rounded bg-gray-100" />
            </div>
            <div className="h-3.5 w-24 rounded bg-gray-100" />
            <div className="h-3.5 w-16 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
