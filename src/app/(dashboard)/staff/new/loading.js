export default function StaffNewLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-3 w-64 rounded bg-gray-100" />
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
