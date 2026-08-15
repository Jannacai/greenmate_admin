export default function VoucherEditLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse pb-8">
      <div className="mb-5 h-8 w-56 rounded bg-gray-200" />
      <div className="mb-4 h-9 w-40 rounded-lg bg-gray-100" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        <div className="order-2 space-y-5 lg:order-1">
          <div className="h-56 rounded-xl bg-gray-100" />
          <div className="h-80 rounded-xl bg-gray-100" />
        </div>
        <div className="order-1 space-y-4 lg:order-2">
          <div className="h-52 rounded-xl bg-gray-100" />
          <div className="h-64 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
