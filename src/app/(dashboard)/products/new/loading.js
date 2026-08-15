export default function NewProductLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-5 w-44 rounded bg-gray-200" />
          <div className="h-3 w-72 rounded bg-gray-100" />
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_288px]">
        {/* Left */}
        <div className="space-y-5">
          {/* Thông tin cơ bản */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-10 rounded-lg bg-gray-100" />
            <div className="h-24 rounded-lg bg-gray-100" />
          </div>
          {/* Variations */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-16 rounded-xl bg-gray-100" />
          </div>
          {/* SKU Matrix */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-20 rounded-xl bg-gray-100" />
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
            <div className="h-52 rounded-xl bg-gray-100" />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-10 rounded-lg bg-gray-100" />
            <div className="h-10 rounded-lg bg-gray-100" />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-10 rounded-lg bg-gray-100" />
            <div className="h-10 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
