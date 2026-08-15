export default function RbacLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-5">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="h-3 w-72 rounded bg-gray-100" />
        <div className="mt-2 flex gap-2">
          <div className="h-6 w-24 rounded-full bg-gray-100" />
          <div className="h-6 w-24 rounded-full bg-gray-100" />
          <div className="h-6 w-28 rounded-full bg-gray-100" />
        </div>
      </div>
      <div className="h-14 rounded-xl bg-gray-100" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-gray-100 px-4 py-4 last:border-0">
            <div className="flex gap-4">
              <div className="h-4 w-28 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-4 flex-1 rounded bg-gray-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
